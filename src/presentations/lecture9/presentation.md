@title
\align center
\fontSize 2.2rem
Умные указатели
Лекция 9. Современное управление памятью

Разработка приложений на C++
\date{2026}

---

@section Зачем нужны умные указатели?

---

# Мотивация

**Три типичные ситуации, где сырые указатели создают проблемы.**

---

## Вариант 1. Angry Birds

@code cpp readonly height=60%
class NetworkSystem
{
public:
    virtual ~NetworkSystem() = default;
    virtual std::string load(const std::string& url) = 0;
};

class GameResourcesLoader
{
public:
    GameResourcesLoader(NetworkSystem* network) {...}
private:
    NetworkSystem* network_;
};

class PromoEventsLoader
{
public:
    PromoEventsLoader(NetworkSystem* network) {...}
private:
    NetworkSystem* network_;
};
@end

@fragment
@warning Проблема
Кто удаляет `NetworkSystem`? Два класса хранят сырой указатель — ни один не владеет объектом. Утечка или double free.
@end

---

## Вариант 2. Хеширование

@code cpp readonly height=60%
Hasher *create_hasher(HasherType type)
{
    if (type == CRC32)
        return new HasherCRC32();
    else
        return new HasherSUM32();
}

bool run(const std::string& filename, HasherType type)
{
    std::ifstream ifs(filename);
    if (!ifs)
        return false;

    Hasher *hasher = create_hasher(type);
    std::cout << hasher->calc_hash(ifs);
    delete hasher;
}
@end

@fragment
@warning Проблема
Если `calc_hash` бросит исключение — `delete hasher` не выполнится. Утечка памяти.
@end
@end

---

## Вариант 3. Видеодекодер

@code cpp readonly height=60%
class VideoDecoder
{
public:
    VideoDecoder()
        : codecs_{
            new VideoCodecDIVX(),
            new VideoCodecX264(),
            new VideoCodecXVID()
        }
    {}

    ~VideoDecoder() {
        for (auto* codec: codecs_)
            delete codec;
    }

private:
    std::vector<VideoCodec*> codecs_;
};
@end

@fragment
@warning Проблема
Если конструктор `VideoCodecXVID()` бросит исключение — деструктор не вызовется. Первые два объекта утекут.
@end
@end

---

@section Виды умных указателей

---

# Четыре типа указателей в современном C++

@columns
\gap 1.5rem
@column
\width 50%

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1rem
\borderLeft 4px solid #38bdf8
\borderRadius 8px
- `unique_ptr` — уникальное владение
- `shared_ptr` — разделяемое владение
- `weak_ptr` — наблюдатель за shared-объектом
- `raw pointer` (`T*`) — невладеющий указатель
@end

@column
\width 50%

@note Правило с C++11
\padding 0.75rem
Сырой указатель = невладеющий. Код с сырым указателем **не вызывает** `delete` или `free`. Исключения документируются.
@end

@end

---

# Семантика сырого указателя

@code cpp readonly height=60%
// метод возвращает невладеющий указатель
class ItemsStorage {
    Item* find(int key) const;
};

// функция возвращает указатель на статические данные
const char* get_name() {
    return "Dobryna Nikitich";
}

// параметр может быть nullptr — объект необязателен
Home build_home(const Roof* roof);

// классика C: невладеющий вход → невладеющий выход
const char* find_char(const char* str, char c);
@end

@tip Исключение
`malloc` / `free` — особый случай, где сырой указатель владеет памятью. Но в C++ предпочитайте `new`/`delete`, а лучше — умные указатели.
@end

---

@section std::unique_ptr

---

@yesScroll
# `unique_ptr` — упрощённая реализация

@code cpp readonly height=85%
template<typename T>
class unique_ptr
{
public:
    unique_ptr() : ptr(nullptr) {}
    unique_ptr(T* p) : ptr(p) {}

    ~unique_ptr() { delete ptr; }

    // копировать нельзя
    unique_ptr(const unique_ptr&) = delete;
    unique_ptr& operator=(const unique_ptr&) = delete;

    // перемещать — можно
    unique_ptr(unique_ptr&& rhs) noexcept {
        ptr = rhs.ptr;
        rhs.ptr = nullptr;
    }
    unique_ptr& operator=(unique_ptr&& rhs) noexcept {
        if (this != &rhs) {
            delete ptr;
            ptr = rhs.ptr;
            rhs.ptr = nullptr;
        }
        return *this;
    }

    T& operator->() const noexcept { return *ptr; }

private:
    T* ptr;
};
@end

@fragment
@note Вопрос
Чему равен `sizeof(unique_ptr<T>)`?
@end

@fragment
@tip Ответ
Ровно `sizeof(T*)` — никакого оверхеда.
@end
---

# `std::make_unique` — зачем он нужен

@code cpp readonly

create_person(
    std::unique_ptr<Head>(new Head),
    std::unique_ptr<Body>(new Body)
);



@step highlight=1:blue
// Проблема: утечка при исключении
create_person(
    std::unique_ptr<Head>(new Head),
    std::unique_ptr<Body>(new Body)
);



@step highlight=6:blue
// Проблема: утечка при исключении
create_person(
    std::unique_ptr<Head>(new Head),
    std::unique_ptr<Body>(new Body)
);
// Порядок вычислений не определён!


@step 
// Проблема: утечка при исключении
create_person(
    std::unique_ptr<Head>(new Head),
    std::unique_ptr<Body>(new Body)
);
// Порядок вычислений не определён!
// new Head → new Body → конструктор?
// Если new Body бросит исключение — Head утечёт.
@step
// Решение:
create_person(
    std::make_unique<Head>(),
    std::make_unique<Body>()
);
// Каждый вызов — атомарная операция.
// Утечка невозможна.
@end

@fragment
@note C++17
С **C++17** аргумент функции вычисляется полностью до другого аргумента. Проблема с `unique_ptr(new T)` ушла, но `make_unique` всё равно чище и проще.
@end

---

# `std::make_unique` передаёт аргументы в конструктор

@code cpp readonly
class Head {
public:
    Head(Color eyes_color, float nose_length_cm);
};

std::unique_ptr<Head> buratino_head =
    std::make_unique<Head>(Color::Blue, 25);
@end

---

# Пример 1: Angry Birds с `unique_ptr`

@code cpp readonly height=85%
class SessionContext {
public:
    SessionContext(std::unique_ptr<INetwork> network,
                   std::unique_ptr<IResources> resources)
        : network_(std::move(network))
        , resources_(std::move(resources))
    {}

    INetwork& network() const { return *network_; }
    IResources& resources() const { return *resources_; }

private:
    std::unique_ptr<INetwork> network_;
    std::unique_ptr<IResources> resources_;
};

// Для игры
SessionContext makeSessionContextForGame() {
    return SessionContext(
        std::make_unique<NetworkImpl>(),
        std::make_unique<ResourcesImpl>());
}

// Для тестов
SessionContext makeSessionContextForTesting() {
    return SessionContext(
        std::make_unique<NetworkMock>(),
        std::make_unique<ResourcesMock>());
}
@end

---

# Пример 2: Hasher с `unique_ptr`

@code cpp readonly height=85%
std::unique_ptr<Hasher> create_hasher(HasherType type)
{
    if (type == CRC32)
        return std::make_unique<HasherCRC32>();
    else
        return std::make_unique<HasherSUM32>();
}

bool run(const std::string& filename, HasherType type)
{
    std::ifstream ifs(filename);
    if (!ifs)
        return false;

    std::unique_ptr<Hasher> hasher = create_hasher(type);
    std::cout << hasher->calc_hash(ifs);
    // деструктор unique_ptr вызовет delete автоматически
}
@end

---

# Пример 3: Видеодекодер с `unique_ptr`

@code cpp readonly
class VideoDecoder
{
public:
    VideoDecoder()
    {
        codecs_.reserve(3);
        codecs_.emplace_back(std::make_unique<VideoCodecDIVX>());
        codecs_.emplace_back(std::make_unique<VideoCodecX264>());
        codecs_.emplace_back(std::make_unique<VideoCodecXVID>());
    }
    // деструктор не нужен — vector сам удалит unique_ptr

private:
    std::vector<std::unique_ptr<VideoCodec>> codecs_;
};
@end

---

@section std::shared_ptr

---

# Для чего нужен `shared_ptr`

`unique_ptr` позволяет владеть только **одному** объекту

@code cpp readonly
std::unique_ptr<T> a(new T);
std::unique_ptr<T> b = a;
@step highlight=2:red
std::unique_ptr<T> a(new T);
std::unique_ptr<T> b = a; // ошибка компиляции
@step
std::shared_ptr<T> a(new T);
std::shared_ptr<T> b = a;
std::shared_ptr<T> c = b;

a.reset();
b.reset();
// объект `T` жив — им владеет `c`
@end

@fragment
`shared_ptr` разрешает владеть **нескольким** объектам.
@end

@fragment
\marginTop -0.75rem
@warning Вопрос:
Объект должен умереть, тогда и только тогда, когда умрёт последний его владелец. **Какую информацию придётся хранить?**
@end
---

# Для чего нужен `shared_ptr`

Нужен **reference count** — счетчик ссылок.

@fragment
\marginTop -0.75rem
@warning Вопрос:
Хорошо, а **где хранить этот счетчик?**
@end

@fragment
@code cpp readonly
// Три объекта — три счётчика?
shared_ptr a → ref=1
shared_ptr b = a → ref=?
shared_ptr c = b → ref=?
@end

@fragment
\marginTop -0.5rem
@warning Проблема
При копировании придётся синхронизировать все экземпляры.

При `reset()` — тоже.

Это невозможно без **общего состояния**.
@end

---

# Для чего нужен `shared_ptr`

Один счётчик на все копии, указывающие на один объект

@columns
@column
\width 45%
@image assets/sp_internals.PNG
@column
@note std::shared_ptr<T>

- `Ptr to T` — указатель на объект

- `Ptr to Control Block` — указатель на общий блок
@end
@end

@tip Control Block:
\marginTop -0.5rem

- Reference Count — сколько `shared_ptr` владеют объектом. Когда падает до `0` — объект удаляется.

- Weak Count - сколько `weak_ptr` наблюдают за объектом. Когда падает до `0` — удаляется сам control block.

- Custom Deleter / Allocator - `shared_ptr` стирает тип удалятора
@end

---

# Обратите внимание на

@important Ключевой момент
**Control block** нельзя удалить вместе с объектом.

Живые `weak_ptr` держат указатель на него — иначе `lock()` обратится к удалённой памяти.
@end

---

# Сравнение между `unique_ptr` и `shared_ptr`

@columns
\gap 2rem
@column
\width 50%
@style
\bg rgba(30, 41, 59, 0.7)
\padding 1rem
\borderRadius 8px
**unique_ptr\<T\>**

`sizeof` = `sizeof(void*)`

- Один указатель на объект

- Удалятор — часть типа (zero-cost при стандартном).
@end
@column
\width 50%
@style
\bg rgba(30, 41, 59, 0.7)
\padding 1rem
\borderRadius 8px
**shared_ptr\<T\>**

`sizeof` = `2 * sizeof(void*)`

- Два указателя: на объект + на control block.

- Удалятор стирает тип — хранится в блоке.
@end
@end

---

# `shared_ptr` — пример со счётчиком

@columns
@column 
\width 70%
@code cpp readonly
{
    std::shared_ptr<Cat> cat1(new Cat);  // refs=1
    std::shared_ptr<Cat> cat2;
    cat2 = cat1;  // refs=2
    std::shared_ptr<Cat> cat3 = cat1;  // refs=3
    cat1.reset();  // refs=2
    std::weak_ptr<Cat> weak_cat = cat2;  // refs=2, weak=1
    std::shared_ptr<Cat> cat4 = weak_cat.lock();
    if (cat4)  // refs=3
        ...;
}
// все shared_ptr уничтожены → объект удалён
@column
\width 30%
@image assets/IMG_20260318_163645_519.jpg

@presenter
Рисуйте на доске
Эти примеры лучше всего объяснять, рисуя стрелки и control block в памяти.
@end

---

# Визуализация работы `shared_ptr`

@video assets/HowSharedPtrWorks.mp4

---

# Типичные ошибки с `shared_ptr`

**1. Два кластера — один объект**

@columns
@column 
\width 65%
@code cpp readonly
{
    Cat* y = new Cat();
    std::shared_ptr<Cat> cat1(y);
    std::shared_ptr<Cat> cat2(y);
}
@end
@column
\width 35%
@image assets/IMG_20260318_163624_458.jpg

@end

@important Обратите внимание
Два control block!
**Double free!**
@end

---

# Операция «Тайная лиса»

**CVE-2014-1776 (2014)**. Уязвимость use-after-free в `MSHTML.dll` — использование сырого указателя `CMarkup*` в движке рендеринга Internet Explorer. Затронуло версии IE 6–11 (~26% всех браузеров того времени).

@code cpp readonly
// MSHTML.dll
CMarkup* pMarkup = GetCurrentMarkup();  // сырой указатель
pMarkup->Release();                     // объект уничтожается




@step highlight=6:blue
// MSHTML.dll
CMarkup* pMarkup = GetCurrentMarkup();  // сырой указатель
pMarkup->Release();                     // объект уничтожается

// ... далее, в другой части кода ...
pMarkup->IsConnectedToPrimaryMarkup();  // UAF - запись в освобожденную память
// хакер контролирует этот участок памяти
@end

---

# Операция «Тайная лиса»

**CVE-2014-1776 (2014)**. Уязвимость use-after-free в `MSHTML.dll` — использование сырого указателя `CMarkup*` в движке рендеринга Internet Explorer. Затронуло версии IE 6–11 (~26% всех браузеров того времени).

@code cpp readonly
// MSHTML.dll
CMarkup* pMarkup = GetCurrentMarkup();  // сырой указатель
pMarkup->Release();                     // объект уничтожается

// ... далее, в другой части кода ...
pMarkup->IsConnectedToPrimaryMarkup();  // UAF - запись в освобожденную память
// хакер контролирует этот участок памяти
@end

@style
\bg rgba(239, 68, 68, 0.1)
\color #e2e8f0
\padding 0.5rem 1rem 0.25rem 1rem
\margin 0.2rem 0 0.2rem 0
\borderLeft 4px solid #ef4444
\borderRadius 8px
Уязвимостью воспользовалась группировка **Advanced Persistent Threat (APT)**, нацеленная на государственные и финансовые структуры.

Microsoft срочно выпустила внеплановый патч безопасности. 
@end


---

# Типичные ошибки с `shared_ptr`

**2. Циклы владения**

@code cpp readonly
{
    auto barsic = std::make_shared<Cat>();
    auto marsic = std::make_shared<Cat>();
    



}
@step highlight=4:blue
{
    auto barsic = std::make_shared<Cat>();
    auto marsic = std::make_shared<Cat>();
    barsic->set_friend(marsic);
    


}
@step highlight=5:blue
{
    auto barsic = std::make_shared<Cat>();
    auto marsic = std::make_shared<Cat>();
    barsic->set_friend(marsic);
    marsic->set_friend(barsic);
    

}
@step
{
    auto barsic = std::make_shared<Cat>();
    auto marsic = std::make_shared<Cat>();
    barsic->set_friend(marsic);
    marsic->set_friend(barsic);
    // refs никогда не станет 0
    // Утечка!
}
@end

@fragment
@tip Решение циклов
Заменить одну из сторон на `std::weak_ptr`. Weak-указатель не увеличивает счётчик ссылок.
@end

---

# Типичные ошибки с `shared_ptr`

**2. Циклы владения**

@columns
@column
\width 65%
@code cpp readonly
{
    auto barsic = std::make_shared<Cat>();
    auto marsic = std::make_shared<Cat>();
    barsic->set_friend(marsic);
    marsic->set_friend(barsic);
    // refs никогда не станет 0
    // Утечка!
}
@end
@column
\width 35%

@image assets/IMG_20260318_165919_839.jpg
@end

@tip Решение циклов
Заменить одну из сторон на `std::weak_ptr`. Weak-указатель не увеличивает счётчик ссылок.

---

# Пример циклов владения

[MinecraftConsoles/Entity.h#L58](https://github.com/smartcmd/MinecraftConsoles/blob/a94ee1ca224f5822351ee2f7fd5261dc2e508fdf/Minecraft.World/Entity.h#L58)

@code cpp readonly
class Entity : public enable_shared_from_this<Entity> {
public:
    // ...
    std::weak_ptr<Entity> rider;		// Changed to weak to avoid circular dependency between rider/riding entity
    std::shared_ptr<Entity> riding;
    // ...
}
@end

[MinecraftConsoles/Entity.cpp#L1061](https://github.com/smartcmd/MinecraftConsoles/blob/a94ee1ca224f5822351ee2f7fd5261dc2e508fdf/Minecraft.World/Entity.cpp#L1061)

@code cpp readonly
void Entity::causeFallDamage(float distance) {
	if (rider.lock() != nullptr) rider.lock()->causeFallDamage(distance);
}
@end

---

# `make_shared` — быстрее обычного конструктора

@columns
@column
\width 50%
@note Медленно
`shared_ptr<T>(new T())`

Два `malloc`: один для объекта, один для control block.

Объект и блок — в разных местах кучи.
@end
@column
\width 50%
@tip Быстро
`make_shared<T>()`

Один `malloc`: объект и control block рядом в памяти.

Лучше для кэша, меньше накладных расходов.
@end
@end

@fragment
@code cpp readonly
// 200 аллокаций на 100 объектов
herd.push_back(std::shared_ptr<Cat>(new Cat()));

// 100 аллокаций на 100 объектов
herd.push_back(std::make_shared<Cat>());
@end

---

# `make_shared` — быстрее обычного конструктора

@video assets/MakeShared.mp4

---

@section Custom deleter и scope exit

---

# Custom deleter — управление не-RAII ресурсами

@code cpp readonly
// Проблема: fclose может не вызваться при исключении
void write_to_csv(const char* filename)
{
    FILE* fo = fopen(filename, "w");
    // ...код записи...
    fclose(fo);  // а если исключение выше?
}
@step
// Решение: unique_ptr с custom deleter
void write_to_csv(const char* filename)
{
    std::unique_ptr<FILE, int (*)(FILE*)> fo(
        fopen(filename, "w"),
        &fclose);
    // fclose вызовется автоматически
}
@end

---

# Как это читать обычным смертным?

@code cpp readonly showLines
// уникальное владение ресурсом
std::unique_ptr<
@step highlight=3:blue,4:blue,
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
@step highlight=5:blue,6:blue,
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
                // тип нестандартного удалятора (в данном случае - сигнатура функции, т.к. передаётся функция)
                int (*)(FILE*)>
@step highlight=7:blue,8:blue,
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
                // тип нестандартного удалятора (в данном случае - сигнатура функции, т.к. передаётся функция)
                int (*)(FILE*)>
                // имя переменной + вызов конструктора
                foo(
                    // ресурс, которым владеем
                    fopen(filename, "r"),
                    // нестандартный удалятор - указатель на функцию
                    &fclose
                );
@step highlight=9:blue,10:blue,
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
                // тип нестандартного удалятора (в данном случае - сигнатура функции, т.к. передаётся функция)
                int (*)(FILE*)>
                // имя переменной + вызов конструктора
                foo(
                    // ресурс, которым владеем
                    fopen(filename, "r"),
                    // нестандартный удалятор - указатель на функцию
                    &fclose
                );
@step highlight=11:blue,12:blue,
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
                // тип нестандартного удалятора (в данном случае - сигнатура функции, т.к. передаётся функция)
                int (*)(FILE*)>
                // имя переменной + вызов конструктора
                foo(
                    // ресурс, которым владеем
                    fopen(filename, "r"),
                    // нестандартный удалятор - указатель на функцию
                    &fclose
                );
@step
// уникальное владение ресурсом
std::unique_ptr<
                // ресурс - FILE, внутри хранится FILE*
                FILE,
                // тип нестандартного удалятора (в данном случае - сигнатура функции, т.к. передаётся функция)
                int (*)(FILE*)>
                // имя переменной + вызов конструктора
                foo(
                    // ресурс, которым владеем
                    fopen(filename, "r"),
                    // нестандартный удалятор - указатель на функцию
                    &fclose
                );
@end

---

# Вариации custom deleter

@code cpp readonly
// Явный тип удалятора
std::unique_ptr<FILE, int (*)(FILE*)> p(
    fopen("input.txt", "r"), &fclose);

// decltype — не нужно вспоминать сигнатуру
std::unique_ptr<FILE, decltype(&fclose)> p(
    fopen("input.txt", "r"), &fclose);
@step
// Функтор
struct FileCloser {
    void operator()(FILE* f) { fclose(f); }
};
std::unique_ptr<FILE, FileCloser> p(
    fopen("input.txt", "r"), FileCloser());
@step
// Лямбда
auto close_file = [](FILE* f) { fclose(f); };
std::unique_ptr<FILE, decltype(close_file)> p(
    fopen("input.txt", "r"), close_file);
@end

@fragment
@code cpp readonly
// shared_ptr — тип deleter не в шаблоне
std::shared_ptr<FILE> p(fopen("input.txt", "r"), close_file);
@end

---

# Custom deleter — донастройка разрушения

@code cpp readonly
std::shared_ptr<FILE> p(
    fopen("error.log", "r"),
    [](FILE* f) {
        std::cout << "you are going to die!\n";
        fclose(f);

        schedule_send_error_log_to_server("error.log");
    });
@end

@fragment
@warning Вопрос:
Чего не должны делать custom deleter?
@end

---

# Custom deleter — донастройка разрушения

@code cpp readonly
std::shared_ptr<FILE> p(
    fopen("error.log", "r"),
    [](FILE* f) {
        std::cout << "you are going to die!\n";
        fclose(f);
        
        schedule_send_error_log_to_server("error.log");
    });
@end

@important Важно
\padding 0.75rem
Custom deleter **не должен бросать исключений**. Это те же правила, что для деструкторов.

---

@section Правила работы с умными указателями

---

# Когда что использовать

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\borderRadius 8px
\border 1px solid #334155

- **По значению** — если объект небольшой и копируемый
- **`unique_ptr`** — единоличное владение (по умолчанию)
- **`shared_ptr`** — множественное владение (только когда действительно нужно)
- **`weak_ptr`** — разрыв циклов владения
@end

@columns
\gap 1rem
@column
\width 55%

@warning Не надо так
@code cpp readonly
struct Point {
    std::unique_ptr<float> x;
    std::unique_ptr<float> y;
};
@end

@column
\width 43%

@tip Так правильно
@code cpp readonly
struct Point {
    float x;
    float y;
};
@end

---

# Передача в функции

## Функция не работает с владением

@code cpp readonly
void print_person(const Person& p) {
    std::cout << p.name;
}

void make_elder(Person& p) {
    ++p.age;
}

auto ilya = std::make_shared<Person>("Ilya", "Muromec", 32);
print_person(*ilya);
make_elder(*ilya);
@end

@tip
Передавайте `T&` или `const T&`.
@end


---

# Передача в функции

## Функция работает с владением

@code cpp readonly
class Squad {
public:
    void add_warrior(std::shared_ptr<Person> w)
    {
        warriors_.push_back(w);
    }
private:
    std::vector<std::shared_ptr<Person>> warriors_;
};
@end

@tip
Передавайте `shared_ptr` по значению.
@end

---

# Итого

@style
\bg rgba(30, 41, 59, 0.7)
\color #e2e8f0
\padding 1.2rem
\borderRadius 8px
\border 1px solid #334155

- В нормальном **C++** почти никогда не нужен явный `new` / `delete`
- `make_unique` и `make_shared` — стандартный способ создания
- `make_shared` быстрее конструктора `shared_ptr` (меньше аллокаций)
- Сырой указатель = невладеющий (по договорённости с **C++11**)
- Умный указатель в параметре функции — только если функция управляет владением

@end

---

# За пределами лекции

@style
\padding 1rem
\bg rgba(30, 41, 59, 0.4)
\borderRadius 8px

- Custom allocator
- `shared_from_this`
- `static_pointer_cast` / `dynamic_pointer_cast`
- `std::shared_ptr` на члены класса (aliasing constructor)
- Intrusive pointers

@end

@divider #38bdf8

Репозиторий с реализацией: [github.com/vdovetzi/Smart-Pointers](https://github.com/vdovetzi/Smart-Pointers)

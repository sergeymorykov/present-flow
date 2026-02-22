import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';


const PresentationPolymorphism: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cppCode, setCppCode] = useState<string>(`#include <iostream>
#include <string>

class Animal {
public:
    virtual void makeSound() {
        std::cout << "Some sound" << std::endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void makeSound() override {
        std::cout << "Woof!" << std::endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() override {
        std::cout << "Meow!" << std::endl;
    }
};

int main() {
    Animal* animals[2];
    animals[0] = new Dog();
    animals[1] = new Cat();
    
    for(int i = 0; i < 2; i++) {
        animals[i]->makeSound();
    }
    
    delete animals[0];
    delete animals[1];
    return 0;
}`);
  
  const [output, setOutput] = useState<string>('Нажмите "Запустить код"');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Навигация с клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, 3));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCompile = async () => {
    setIsLoading(true);
    setOutput('🔄 Компиляция...');

    try {
      // 🔍 Логируем отправляемые данные
      const payload = {
        code: cppCode,
        compiler: 'gcc-head',
        options: 'warning-all,std=c++17',
      };
      console.log('📤 Sending to Wandbox:', payload);
      
      const compilerUrl = process.env.CPP_COMPILER_URL;
      if (!compilerUrl) {
        throw new Error('CPP_COMPILER_URL не задан в .env');
      }

      const response = await fetch(compilerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.slice(0, 200)}`);
      }

      // Парсим JSON вручную из text
      const result = JSON.parse(responseText);

      if (result.compiler_error) {
        setOutput(`❌ Ошибка компиляции:\n${result.compiler_error}`);
      } else if (result.program_error) {
        setOutput(`❌ Ошибка выполнения:\n${result.program_error}`);
      } else if (result.program_output) {
        setOutput(`✅ Результат:\n${result.program_output}`);
      } else {
        setOutput('⚠️ Код выполнен без вывода');
      }
    } catch (error) {
      console.error('❌ Compilation failed:', error);
      setOutput(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const slides = [
    // Слайд 1: Введение
    <div key="slide1" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    }}>
      <h1 style={{ 
        fontSize: '3.5em', 
        color: '#00d9ff', 
        marginBottom: '40px',
        textShadow: '0 0 20px rgba(0, 217, 255, 0.5)'
      }}>
        Полиморфизм в C++
      </h1>
      <p style={{ 
        fontSize: '1.5em', 
        color: '#e0e0e0', 
        textAlign: 'center',
        maxWidth: '800px',
        lineHeight: '1.6',
        marginBottom: '50px'
      }}>
        Способность объектов разных классов реагировать на одни и те же методы по-разному
      </p>
      <div style={{ 
        display: 'flex', 
        gap: '40px',
        fontSize: '1.3em',
        color: '#a0a0a0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>🎯</div>
          <div>Единый интерфейс</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>🔄</div>
          <div>Разная реализация</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>✨</div>
          <div>Гибкость кода</div>
        </div>
      </div>
    </div>,

    // Слайд 2: Пример Java
    <div key="slide2" style={{
      minHeight: '100vh',
      padding: '60px 40px',
      background: '#1a1a2e',
      overflowY: 'auto'
    }}>
      <h2 style={{ color: '#00d9ff', marginBottom: '40px', fontSize: '2.5em' }}>
        Пример на Java
      </h2>
      <pre style={{ 
        fontSize: '1em', 
        textAlign: 'left',
        background: '#0a0a0a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #333',
        maxWidth: '900px',
        margin: '0 auto',
        overflowX: 'auto',
        boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
      }}>
        <code style={{ color: '#d4d4d4', fontFamily: 'Consolas, Monaco, monospace' }}>
{`class Animal {
  void makeSound() {
    System.out.println("Some sound");
  }
}

class Dog extends Animal {
  @Override
  void makeSound() {
    System.out.println("Woof");
  }
}

class Cat extends Animal {
  @Override
  void makeSound() {
    System.out.println("Meow");
  }
}

public class Main {
  public static void main(String[] args) {
    Animal myDog = new Dog();
    Animal myCat = new Cat();
    
    myDog.makeSound(); // Выведет "Woof"
    myCat.makeSound(); // Выведет "Meow"
  }
}`}
        </code>
      </pre>
    </div>,

    // Слайд 3: C++ Live Demo
    <div key="slide3" style={{
      minHeight: '100vh',
      padding: '40px',
      background: '#1a1a2e',
      overflowY: 'auto'
    }}>
      <h2 style={{ 
        color: '#00d9ff', 
        marginBottom: '30px', 
        fontSize: '2.5em',
        textAlign: 'center'
      }}>
        🔧 C++ Live Demo
      </h2>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
      }}>
        {/* Редактор кода */}
        <div style={{ 
          height: '400px', 
          borderRadius: '10px', 
          overflow: 'hidden',
          border: '2px solid #444',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
        }}>
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={cppCode}
            onChange={(value) => setCppCode(value || '')}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              roundedSelection: false,
              padding: { top: 16 },
              fontFamily: 'Consolas, Monaco, monospace',
              fontLigatures: true,
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Кнопка */}
        <button
          onClick={handleCompile}
          disabled={isLoading}
          style={{
            padding: '16px 40px',
            fontSize: '1.2rem',
            background: isLoading ? '#555' : '#00d9ff',
            color: isLoading ? '#888' : '#1a1a2e',
            border: 'none',
            borderRadius: '10px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            alignSelf: 'center',
            transition: 'all 0.3s',
            boxShadow: isLoading ? 'none' : '0 6px 12px rgba(0, 217, 255, 0.4)',
            transform: isLoading ? 'none' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 217, 255, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 217, 255, 0.4)';
            }
          }}
        >
          {isLoading ? '⏳ Компиляция...' : '▶ Запустить код'}
        </button>

        {/* Консоль */}
        <div style={{
          background: '#0a0a0a',
          padding: '25px',
          borderRadius: '10px',
          fontSize: '1em',
          whiteSpace: 'pre-wrap',
          minHeight: '150px',
          maxHeight: '300px',
          overflowY: 'auto',
          border: '2px solid #333',
          fontFamily: 'Consolas, Monaco, monospace',
          boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)'
        }}>
          <div style={{ 
            color: '#888', 
            marginBottom: '15px',
            fontSize: '1.2em',
            borderBottom: '1px solid #333',
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📟</span> Консоль:
          </div>
          <div style={{ 
            color: output.startsWith('✅') ? '#4ade80' : 
                   output.startsWith('❌') ? '#f87171' : '#e0e0e0',
            lineHeight: '1.6'
          }}>
            {output}
          </div>
        </div>
      </div>
    </div>,

    // Слайд 4: Вывод
    <div key="slide4" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)'
    }}>
      <h2 style={{ 
        fontSize: '3em', 
        color: '#00d9ff', 
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        Вывод
      </h2>
      <p style={{ 
        fontSize: '1.8em', 
        color: '#e0e0e0', 
        textAlign: 'center',
        maxWidth: '800px',
        lineHeight: '1.6',
        marginBottom: '60px'
      }}>
        Полиморфизм позволяет писать<br/>
        <strong style={{ color: '#00d9ff' }}>гибкий</strong> и <strong style={{ color: '#00d9ff' }}>расширяемый</strong> код
      </p>
      <div style={{ 
        fontSize: '1.1em', 
        color: '#666',
        textAlign: 'center',
        borderTop: '2px solid #333',
        paddingTop: '30px'
      }}>
        Present Flow © 2026<br/>
        <span style={{ fontSize: '0.95em', marginTop: '10px', display: 'block' }}>
          Разработка приложений на C++
        </span>
      </div>
    </div>
  ];

  return (
    <div style={{ 
      position: 'relative',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Текущий слайд */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transition: 'opacity 0.5s ease-in-out'
      }}>
        {slides[currentSlide]}
      </div>

      {/* Навигация */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        gap: '15px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          style={{
            padding: '12px 20px',
            background: currentSlide === 0 ? '#333' : '#00d9ff',
            color: currentSlide === 0 ? '#666' : '#1a1a2e',
            border: 'none',
            borderRadius: '8px',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
            opacity: currentSlide === 0 ? 0.5 : 1,
            transition: 'all 0.3s'
          }}
        >
          ← Назад
        </button>
        <button
          onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          style={{
            padding: '12px 20px',
            background: currentSlide === slides.length - 1 ? '#333' : '#00d9ff',
            color: currentSlide === slides.length - 1 ? '#666' : '#1a1a2e',
            border: 'none',
            borderRadius: '8px',
            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
            opacity: currentSlide === slides.length - 1 ? 0.5 : 1,
            transition: 'all 0.3s'
          }}
        >
          Вперед →
        </button>
      </div>

      {/* Индикатор слайдов */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        background: 'rgba(0,0,0,0.6)',
        padding: '10px 20px',
        borderRadius: '8px',
        color: '#00d9ff',
        fontSize: '1em',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Подсказка */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        padding: '8px 16px',
        borderRadius: '6px',
        color: '#888',
        fontSize: '0.9em',
        zIndex: 1000
      }}>
        Используйте ← → для навигации
      </div>
    </div>
  );
};

export default PresentationPolymorphism;
import { Deck, DefaultTemplate, MarkdownSlideSet } from 'spectacle';
import mdContent from './slides.md';

const PresentationPolymorphism: React.FC = () => (
  <Deck template={() => <DefaultTemplate />}>
    <MarkdownSlideSet>{mdContent}</MarkdownSlideSet>
  </Deck>
);

export default PresentationPolymorphism;
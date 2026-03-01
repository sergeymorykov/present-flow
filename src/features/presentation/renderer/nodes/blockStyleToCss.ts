import { BlockStyle } from '../../parser/types';

export const blockStyleToCss = (s: BlockStyle | undefined): React.CSSProperties => {
  if (!s) return {};
  return {
    ...(s.textAlign && { textAlign: s.textAlign, ['--block-text-align' as string]: s.textAlign }),
    ...(s.marginTop && { marginTop: s.marginTop }),
    ...(s.marginRight && { marginRight: s.marginRight }),
    ...(s.marginBottom && { marginBottom: s.marginBottom }),
    ...(s.marginLeft && { marginLeft: s.marginLeft }),
    ...(s.fontSize && { fontSize: s.fontSize }),
    ...(s.width && { width: s.width }),
    ...(s.height && { height: s.height }),
    ...(s.backgroundColor && { backgroundColor: s.backgroundColor }),
    ...(s.color && { color: s.color }),
    ...(s.padding && { padding: s.padding }),
    ...(s.borderLeft && { borderLeft: s.borderLeft }),
    ...(s.borderRadius && { borderRadius: s.borderRadius }),
    ...(s.gap && { gap: s.gap }),
    ...(s.border && { border: s.border }),
  };
};

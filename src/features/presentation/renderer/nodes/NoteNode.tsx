import React from 'react';
import { NoteNode as NoteNodeType, SlideNode } from '../../parser/types';
import { NodeRenderer } from '../NodeRenderer';
import { FragmentNode } from './FragmentNode';
import styles from './NoteNode.module.css';

type FragmentCounter = { current: number };

type Props = {
  node: NoteNodeType;
  visibleFragments: number;
  fragmentCounter: FragmentCounter;
};

const DEFAULT_LABELS: Record<string, string> = {
  note: 'Заметка',
  warning: 'Внимание',
  tip: 'Совет',
  important: 'Важно',
};

const renderNoteChild = (
  child: SlideNode,
  index: number,
  visibleFragments: number,
  fragmentCounter: FragmentCounter
): React.ReactNode => {
  if (child.type === 'fragment') {
    const visible = fragmentCounter.current < visibleFragments;
    fragmentCounter.current += 1;
    return <FragmentNode key={index} node={child} visible={visible} />;
  }
  return <NodeRenderer key={index} node={child} />;
};

export const NoteNodeComponent: React.FC<Props> = ({
  node,
  visibleFragments,
  fragmentCounter,
}) => {
  const variantClass = styles[`variant_${node.variant}`] ?? '';
  const label = node.label ?? DEFAULT_LABELS[node.variant] ?? '';

  const s = node.style;
  const inlineStyle: React.CSSProperties = {
    ...(s?.backgroundColor && { background: s.backgroundColor }),
    ...(s?.color && { color: s.color }),
    ...(s?.padding && { padding: s.padding }),
    ...(s?.borderLeft && { borderLeft: s.borderLeft }),
    ...(s?.borderRadius && { borderRadius: s.borderRadius }),
    ...(s?.fontSize && { fontSize: s.fontSize }),
    ...(s?.marginTop && { marginTop: s.marginTop }),
    ...(s?.marginBottom && { marginBottom: s.marginBottom }),
  };
  const hasInline = Object.keys(inlineStyle).length > 0;

  return (
    <div
      className={`${styles.note} ${variantClass}`}
      style={hasInline ? inlineStyle : undefined}
    >
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.content}>
        {node.children.map((child, i) =>
          renderNoteChild(child, i, visibleFragments, fragmentCounter)
        )}
      </div>
    </div>
  );
};

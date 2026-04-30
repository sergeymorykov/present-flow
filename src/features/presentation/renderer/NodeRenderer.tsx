import React from 'react';
import { SlideNode } from '../parser/types';
import { TextNode } from './nodes/TextNode';
import { ImageNode } from './nodes/ImageNode';
import { VideoNode } from './nodes/VideoNode';
import { CodeNode } from './nodes/CodeNode';
import { TableNode } from './nodes/TableNode';
import { DividerNodeComponent } from './nodes/DividerNode';
import { BadgeRowNode } from './nodes/BadgeRowNode';
import { DiagramNode } from './nodes/DiagramNode';

// FragmentNode, NoteNode, StyledBlock and ColumnsNode are NOT rendered here —
// they are handled by ContentSlide which passes visibility/fragment state.

type Props = { node: SlideNode };

export const NodeRenderer: React.FC<Props> = ({ node }) => {
  if (node.type === 'text') return <TextNode node={node} />;
  if (node.type === 'image') return <ImageNode node={node} />;
  if (node.type === 'video') return <VideoNode node={node} />;
  if (node.type === 'code') return <CodeNode node={node} />;
  if (node.type === 'table') return <TableNode node={node} />;
  if (node.type === 'divider') return <DividerNodeComponent node={node} />;
  if (node.type === 'badge-row') return <BadgeRowNode node={node} />;
  if (node.type === 'diagram') return <DiagramNode node={node} />;

  return null;
};

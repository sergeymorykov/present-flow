import React from 'react';
import { SlideNode } from '../parser/types';
import { TextNode } from './nodes/TextNode';
import { ImageNode } from './nodes/ImageNode';
import { VideoNode } from './nodes/VideoNode';
import { CodeNode } from './nodes/CodeNode';
import { TableNode } from './nodes/TableNode';
import { ColumnsNode } from './nodes/ColumnsNode';

// FragmentNode is NOT rendered here — it is handled exclusively by ContentSlide,
// which passes the correct `visible` prop based on navigation state.

type Props = { node: SlideNode };

export const NodeRenderer: React.FC<Props> = ({ node }) => {
  if (node.type === 'text') return <TextNode node={node} />;
  if (node.type === 'image') return <ImageNode node={node} />;
  if (node.type === 'video') return <VideoNode node={node} />;
  if (node.type === 'code') return <CodeNode node={node} />;
  if (node.type === 'table') return <TableNode node={node} />;
  if (node.type === 'columns') return <ColumnsNode node={node} />;

  return null;
};

import React from 'react';
import { FragmentNode as FragmentNodeType } from '../../parser/types';
import { TextNode } from './TextNode';
import styles from './FragmentNode.module.css';

type Props = { node: FragmentNodeType; visible: boolean };

export const FragmentNode: React.FC<Props> = ({ node, visible }) => (
  <div className={visible ? styles.visible : styles.hidden}>
    <TextNode node={{ type: 'text', content: node.content }} />
  </div>
);

import React from 'react';
import type { Question } from '../../types';
import { TenFrame } from './TenFrame';
import { NumberLine } from './NumberLine';
import { PlaceValueBlocks } from './PlaceValueBlocks';
import { Ruler } from './Ruler';
import { ClockFace } from './ClockFace';

/**
 * T11C — Lesson-player visual renderer.
 *
 * A question may reference a `visual?: { kind, props }`; this component maps the
 * kind to the matching SVG visual in `src/components/visuals/` and renders it
 * inside the prompt card. Unknown kinds render nothing so a bad data entry can
 * never crash a lesson.
 */
export const QuestionVisual: React.FC<{ visual: NonNullable<Question['visual']> }> = ({ visual }) => {
  const props = (visual.props ?? {}) as unknown;
  switch (visual.kind) {
    case 'TenFrame':
      return <TenFrame {...(props as React.ComponentProps<typeof TenFrame>)} />;
    case 'NumberLine':
      return <NumberLine {...(props as React.ComponentProps<typeof NumberLine>)} />;
    case 'PlaceValueBlocks':
      return <PlaceValueBlocks {...(props as React.ComponentProps<typeof PlaceValueBlocks>)} />;
    case 'Ruler':
      return <Ruler {...(props as React.ComponentProps<typeof Ruler>)} />;
    case 'ClockFace':
      return <ClockFace {...(props as React.ComponentProps<typeof ClockFace>)} />;
    default:
      return null;
  }
};

declare module 'react-window' {
  import type { Component, ComponentType, CSSProperties, Key } from 'react';

  export interface ListChildComponentProps<T = unknown> {
    index: number;
    style: CSSProperties;
    data: T;
    isScrolling?: boolean;
  }

  export interface FixedSizeListProps<T = unknown> {
    children: ComponentType<ListChildComponentProps<T>>;
    className?: string;
    height: number;
    itemCount: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => Key;
    itemSize: number;
    width: number | string;
    innerElementType?: keyof JSX.IntrinsicElements | ComponentType;
    outerElementType?: keyof JSX.IntrinsicElements | ComponentType;
    overscanCount?: number;
    onItemsRendered?: (props: {
      overscanStartIndex: number;
      overscanStopIndex: number;
      visibleStartIndex: number;
      visibleStopIndex: number;
    }) => void;
    role?: string;
    'aria-label'?: string;
  }

  export class FixedSizeList<T = unknown> extends Component<FixedSizeListProps<T>> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
  }
}

export type StructureType = 'ArrayList' | 'LinkedList';

export interface VisualNode {
  id: string;
  value: string;
  isHighlighted: boolean;
  isPointerTarget?: boolean;
  isNew?: boolean;
  isBeingMoved?: boolean;
  moveDirection?: 'left' | 'right';
  index: number;
}

export interface LinkedListNode extends VisualNode {
  nextId: string | null;
  pointerLabel?: string;
}

export type OperationType =
  | 'insert_head'
  | 'insert_index'
  | 'insert_tail'
  | 'remove_head'
  | 'remove_index'
  | 'remove_tail'
  | 'search'
  | 'access';

export interface VisualStep {
  description: string;
  arrayListState: {
    cells: { value: string; isHighlighted: boolean; isMoving?: boolean; originalIndex?: number; isNew?: boolean }[];
    capacity: number;
    headIndex: number;
    size: number;
  };
  linkedListState: {
    nodes: {
      id: string;
      value: string;
      isHighlighted: boolean;
      isPointerTarget?: boolean;
      isNew?: boolean;
      nextId: string | null;
      pointerLabel?: string;
    }[];
    headId: string | null;
    activePointer?: { from: string; to: string | null; label: string } | null;
  };
  highlightedLine?: string;
}

export interface BenchmarkResult {
  operation: string;
  arrayListTime: number; // in microseconds
  linkedListTime: number; // in microseconds
  complexityArray: string;
  complexityList: string;
}

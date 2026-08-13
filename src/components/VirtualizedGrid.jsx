import { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * VirtualizedGrid - A performant grid component for large lists
 * Uses @tanstack/react-virtual for efficient rendering
 */
export default function VirtualizedGrid({
    items,
    renderItem,
    itemWidth = 140,
    itemHeight = 210,
    gap = 12,
    overscan = 3,
    containerRef,
    className = '',
    style = {},
}) {
    const parentRef = useRef(null);

    // Calculate columns based on container width (default to mobile-ish 320px minimum)
    const columns = useMemo(() => {
        const containerWidth = containerRef?.current?.offsetWidth || 320;
        return Math.max(2, Math.floor((containerWidth - gap) / (itemWidth + gap)));
    }, [containerRef, itemWidth, gap]);

    const rows = useMemo(() => {
        return Math.ceil(items.length / columns);
    }, [items.length, columns]);

    const rowVirtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight + gap,
        overscan,
    });

    const columnVirtualizer = useVirtualizer({
        count: columns,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemWidth + gap,
        overscan,
        horizontal: true,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    const handleRef = useCallback((node) => {
        parentRef.current = node;
        if (containerRef) {
            containerRef.current = node;
        }
    }, [containerRef]);

    return (
        <div
            ref={handleRef}
            className={`virtualized-grid ${className}`}
            style={{
                height: `${rows * (itemHeight + gap)}px`,
                width: '100%',
                position: 'relative',
                ...style,
            }}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: `${columnVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${columnVirtualizer.getTotalSize()}px`,
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => {
                            const itemIndex = virtualRow.index * columns + colIndex;
                            const item = items[itemIndex];

                            if (!item) return null;

                            return (
                                <div
                                    key={item.id || itemIndex}
                                    style={{
                                        position: 'absolute',
                                        left: `${colIndex * (itemWidth + gap)}px`,
                                        width: itemWidth,
                                        height: itemHeight,
                                    }}
                                >
                                    {renderItem(item, itemIndex)}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

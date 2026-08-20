import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MediaCard from './MediaCard';

const item = { id: 'movie-1', title: 'Test Movie', type: 'movie', genre: 'Movie', poster: 'poster.jpg' };

describe('MediaCard touch gestures', () => {
    it('opens content for a normal tap', () => {
        const onSelect = vi.fn();
        render(<MediaCard item={item} onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: 'Test Movie' }));
        expect(onSelect).toHaveBeenCalledWith(item);
    });

    it('does not open content after a scroll gesture', () => {
        const onSelect = vi.fn();
        render(<MediaCard item={item} onSelect={onSelect} />);
        const card = screen.getByRole('button', { name: 'Test Movie' });
        fireEvent.pointerDown(card, { pointerType: 'touch', clientX: 20, clientY: 20 });
        fireEvent.pointerMove(card, { pointerType: 'touch', clientX: 20, clientY: 55 });
        fireEvent.pointerUp(card, { pointerType: 'touch', clientX: 20, clientY: 55 });
        fireEvent.click(card);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not open content after Android cancels a pointer during scrolling', () => {
        const onSelect = vi.fn();
        render(<MediaCard item={item} onSelect={onSelect} />);
        const card = screen.getByRole('button', { name: 'Test Movie' });
        fireEvent.pointerDown(card, { pointerType: 'touch', clientX: 20, clientY: 20 });
        fireEvent.pointerCancel(card, { pointerType: 'touch' });
        fireEvent.click(card);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('renders a compact watched marker', () => {
        render(<MediaCard item={item} watched onSelect={vi.fn()} />);
        expect(screen.getByLabelText('Watched')).toBeVisible();
    });
});

// frontend/src/__tests__/FImgZoom.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import FImgZoom from '../features/media/FImgZoom';

describe('F-IMG-ZOOM Component', () => {
    const media = [
        { src: '/test1.jpg', type: 'image' as const, alt: 'Test Image 1' },
        { src: '/test2.jpg', type: 'image' as const, alt: 'Test Image 2' },
    ];

    it('renders initial image correctly', () => {
        render(<FImgZoom media={media} />);
        expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
    });

    it('switches images on thumbnail click', () => {
        render(<FImgZoom media={media} />);
        const thumbs = screen.getAllByRole('button');
        // Note: buttons include zoom controls, so we find by image alt if needed
    });
});

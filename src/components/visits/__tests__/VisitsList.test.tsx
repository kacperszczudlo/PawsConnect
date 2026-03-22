import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { VisitsList } from '../VisitsList';

describe('VisitsList', () => {
  it('renders upcoming visits only for upcoming mode', () => {
    // Arrange
    const mode = 'upcoming' as const;

    // Act
    render(<VisitsList mode={mode} />);

    // Assert
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.queryByText('Max')).toBeNull();
  });

  it('renders history visits only for history mode', () => {
    // Arrange
    const mode = 'history' as const;

    // Act
    render(<VisitsList mode={mode} />);

    // Assert
    expect(screen.getByText('Max')).toBeTruthy();
    expect(screen.queryByText('Luna')).toBeNull();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { sampleDashboardSummary } from '../../test/fixtures';
import { MemoizedMetrics, memoizedMetricsModel } from './MemoizedMetrics';

describe('MemoizedMetrics', () => {
  it('renders the dashboard summary cards', () => {
    render(<MemoizedMetrics summary={sampleDashboardSummary} />);

    expect(screen.getByText('Total stores')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Online now')).toBeInTheDocument();
    expect(screen.getByText('94')).toBeInTheDocument();
    expect(screen.getByText('93.2%')).toBeInTheDocument();
    expect(screen.getByText('$32.48')).toBeInTheDocument();
    expect(screen.getByText('15,234')).toBeInTheDocument();
  });

  it('avoids recomputing derived metrics for the same summary reference', () => {
    const buildSpy = vi.spyOn(memoizedMetricsModel, 'build');

    const { rerender } = render(<MemoizedMetrics summary={sampleDashboardSummary} />);

    expect(buildSpy).toHaveBeenCalledTimes(1);

    rerender(<MemoizedMetrics summary={sampleDashboardSummary} />);

    expect(buildSpy).toHaveBeenCalledTimes(1);

    buildSpy.mockRestore();
  });
});

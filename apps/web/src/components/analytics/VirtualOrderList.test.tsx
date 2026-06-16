import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { VirtualOrderList } from './VirtualOrderList';
import { buildSampleOrders } from '../../test/fixtures';

const sampleOrders = buildSampleOrders(24);

function renderList(props: Partial<ComponentProps<typeof VirtualOrderList>> = {}) {
  return render(
    <MemoryRouter>
      <VirtualOrderList orders={sampleOrders} containerHeight={260} {...props} />
    </MemoryRouter>,
  );
}

describe('VirtualOrderList', () => {
  it('renders with sample orders', () => {
    renderList();

    expect(screen.getByRole('list', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('ord_00001')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Downtown Subway' }).length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no orders', () => {
    render(
      <VirtualOrderList orders={[]} emptyMessage="No orders match the current filters." />,
    );

    expect(screen.getByText('No orders match the current filters.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('mounts the virtual list viewport', () => {
    const { container } = renderList();

    expect(container.querySelector('.virtual-order-list__viewport')).toBeInTheDocument();
    expect(container.querySelector('.virtual-order-list__header')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<VirtualOrderList orders={[]} loading />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('shows a load-more sentinel row when more orders are available', () => {
    render(
      <MemoryRouter>
        <VirtualOrderList
          orders={sampleOrders.slice(0, 2)}
          hasMore
          onLoadMore={() => undefined}
          containerHeight={260}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Load more')).toBeInTheDocument();
  });
});

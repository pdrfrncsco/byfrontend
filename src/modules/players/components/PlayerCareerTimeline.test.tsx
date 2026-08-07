import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlayerCareerTimeline } from './PlayerCareerTimeline';

const career = [
  {
    club: 'FC Test',
    club_slug: 'fc-test',
    joined: '2018-01-01',
    left: '2020-01-01',
    status: 'active',
    matches: 10,
    goals: 2,
    assists: 1,
  },
];

describe('PlayerCareerTimeline', () => {
  it('renders career entries', () => {
    render(
      <MemoryRouter>
        <PlayerCareerTimeline career={career} />
      </MemoryRouter>
    );
    expect(screen.getByText('FC Test')).toBeDefined();
  });
});

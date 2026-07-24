import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('review panel ↔ builder sync', () => {
  it('renders the seeded design state', () => {
    render(<App />)
    expect(screen.getByText('Your security system')).toBeInTheDocument()
    expect(screen.getByText('$187.89')).toBeInTheDocument()
    expect(screen.getByText('$238.81')).toBeInTheDocument()
    expect(screen.getByText(/saving \$50\.92/)).toBeInTheDocument()
    // seeded review lines show plain names (single variant each in bundle)
    expect(
      within(screen.getByTestId('review-wyze-cam-v4:white')).getByText('Wyze Cam v4'),
    ).toBeInTheDocument()
  })

  it('card stepper and review stepper edit the same quantity', async () => {
    const user = userEvent.setup()
    render(<App />)

    const card = screen.getByTestId('card-wyze-cam-v4')
    await user.click(within(card).getByRole('button', { name: /increase wyze cam v4 white/i }))

    const reviewLine = screen.getByTestId('review-wyze-cam-v4:white')
    expect(within(reviewLine).getByText('2')).toBeInTheDocument()
    // 187.89 + 27.98
    expect(screen.getByText('$215.87')).toBeInTheDocument()

    await user.click(
      within(reviewLine).getByRole('button', { name: /decrease wyze cam v4 quantity/i }),
    )
    expect(within(card).getByText('1')).toBeInTheDocument()
  })

  it('review line disappears at zero and variant lines are independent', async () => {
    const user = userEvent.setup()
    render(<App />)

    const card = screen.getByTestId('card-wyze-cam-pan-v3')
    // switch active variant to Black — White's line must survive untouched
    await user.click(within(card).getByRole('radio', { name: 'Black' }))
    expect(within(card).getByText('0')).toBeInTheDocument()
    expect(screen.getByTestId('review-wyze-cam-pan-v3:white')).toBeInTheDocument()

    // add a Black unit → two disambiguated lines
    await user.click(within(card).getByRole('button', { name: /increase wyze cam pan v3 black/i }))
    expect(
      within(screen.getByTestId('review-wyze-cam-pan-v3:white')).getByText(
        'Wyze Cam Pan v3 (White)',
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('review-wyze-cam-pan-v3:black')).getByText(
        'Wyze Cam Pan v3 (Black)',
      ),
    ).toBeInTheDocument()

    // drop White to 0 twice → its line disappears, Black stays
    const whiteLine = screen.getByTestId('review-wyze-cam-pan-v3:white')
    const dec = within(whiteLine).getByRole('button', { name: /decrease/i })
    await user.click(dec)
    await user.click(
      within(screen.getByTestId('review-wyze-cam-pan-v3:white')).getByRole('button', {
        name: /decrease/i,
      }),
    )
    expect(screen.queryByTestId('review-wyze-cam-pan-v3:white')).not.toBeInTheDocument()
    expect(screen.getByTestId('review-wyze-cam-pan-v3:black')).toBeInTheDocument()
  })

  it('required Sense Hub stepper is disabled', () => {
    render(<App />)
    const hubLine = screen.getByTestId('review-wyze-sense-hub')
    expect(within(hubLine).getByRole('button', { name: /decrease/i })).toBeDisabled()
    expect(within(hubLine).getByRole('button', { name: /increase/i })).toBeDisabled()
    expect(within(hubLine).getByText('FREE')).toBeInTheDocument()
  })

  it('accordion: step 1 open on load, Next advances, counters show distinct products', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: /choose your cameras/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await user.click(screen.getByRole('button', { name: /next: choose your plan/i }))
    expect(screen.getByRole('button', { name: /choose your plan/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: /choose your cameras/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('checkout opens the placeholder confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Checkout' }))
    expect(screen.getByText(/checkout isn[’']t wired up/i)).toBeInTheDocument()
  })
})

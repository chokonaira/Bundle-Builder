import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('save my system for later', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('configure → save → leave → return → still there', async () => {
    const user = userEvent.setup()
    const first = render(<App />)

    // configure: bump Cam v4 White to 3
    const card = screen.getByTestId('card-wyze-cam-v4')
    const inc = within(card).getByRole('button', { name: /increase/i })
    await user.click(inc)
    await user.click(inc)

    // save
    await user.click(screen.getByRole('button', { name: /save my system for later/i }))
    expect(screen.getByText(/saved — see you soon!/i)).toBeInTheDocument()

    // leave
    first.unmount()

    // return: quantity and totals restored
    render(<App />)
    const cardAgain = screen.getByTestId('card-wyze-cam-v4')
    expect(within(cardAgain).getByText('3')).toBeInTheDocument()
    // 187.89 + 2 × 27.98
    expect(screen.getByText('$243.85')).toBeInTheDocument()
  })

  it('first-ever visit renders the seeded design state', () => {
    render(<App />)
    expect(screen.getByText('$187.89')).toBeInTheDocument()
  })
})

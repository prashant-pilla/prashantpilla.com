import type { ResearchItem } from './types';

/**
 * Published research and external writing. Featured on /writing until
 * the first MDX post lands in content/writing/.
 *
 * The Medium profile card returns when the first real post is imported.
 */
export const research: ResearchItem[] = [
  {
    id: 'arxiv-2501-17366',
    title: 'Forecasting S&P 500 Using LSTM Models',
    venue: 'arXiv',
    href: 'https://arxiv.org/abs/2501.17366',
    date: '2025-01-29',
    authors: ['Prashant Pilla', 'Raji Mekonen'],
    summary:
      'Compares ARIMA and LSTM networks for forecasting the S&P 500 on daily data from October 2013 to September 2024 with Bloomberg technical and macro features. The LSTM without additional features performed best, and the paper argues that sequence models handle non-linear market dependencies that linear baselines miss.',
    metrics: [
      { label: 'LSTM accuracy (no features)', value: '96.41%' },
      { label: 'LSTM MAE / RMSE (no features)', value: '175.9 / 207.34' },
      { label: 'LSTM accuracy (with features)', value: '92.46%' },
      { label: 'LSTM MAE / RMSE (with features)', value: '369.32 / 412.84' },
      { label: 'ARIMA accuracy', value: '89.8%' },
      { label: 'ARIMA MAE / RMSE', value: '462.1 / 614' },
    ],
  },
];

/** Dated items first (newest first), undated items last. */
export function getResearch(): ResearchItem[] {
  return [...research].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

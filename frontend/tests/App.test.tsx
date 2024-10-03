/* eslint-disable */
/* @ts-nocheck */

import { describe, it, expect } from 'vitest';
import { getByText, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Test template', () => {
  it(`expect App div text content to be "I'm a template"`, () => {
    const { getByText } = render(<App />)
    const appDiv = getByText("I'm a template");
    expect(appDiv).toBeInTheDocument();
  });
});

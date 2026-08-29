import { render, fireEvent } from '@testing-library/react-native';
import { Providers } from '../../test/test-utils';
import { LiveMapScreen } from './live-map-screen';
import React from 'react';
import { useColorScheme } from 'nativewind';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
  };
});

jest.mock('react-native-maps', () => {
  return {
    __esModule: true,
    default: function MockMapView(props: any) { return <>{props.children}</>; },
    PROVIDER_DEFAULT: 'default',
  };
});

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

describe('LiveMapScreen', () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'light' });
  });

  const renderScreen = () =>
    render(
      <Providers>
        <LiveMapScreen />
      </Providers>
    );

  it('renders correctly and handles goBack', async () => {
    const { findByText } = await renderScreen();
    
    expect(await findByText('Live GPS Map')).toBeTruthy();

    const backButton = await findByText('Back');
    await fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('LiveMapScreen dark mode', () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'dark' });
  });

  it('renders correctly in dark mode', async () => {
    const { findByText } = await render(
      <Providers>
        <LiveMapScreen />
      </Providers>
    );
    expect(await findByText('Live GPS Map')).toBeTruthy();
  });
});

import * as React from 'react';
import renderer from 'react-test-renderer';
import HomeScreen from '../index'; // Adjust the import path based on the test file's location

jest.mock('@/components/HelloWave', () => {
  return {
    HelloWave: () => <div>Hello Wave</div>,
  };
});

jest.mock('@/components/ParallaxScrollView', () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div className="parallax-scroll-view">{children}</div>
  );
});

jest.mock('@/components/ThemedText', () => {
  return {
    ThemedText: ({ children }: { children: React.ReactNode }) => (
      <span className="themed-text">{children}</span>
    ),
  };
});

jest.mock('@/components/ThemedView', () => {
  return {
    ThemedView: ({ children }: { children: React.ReactNode }) => (
      <div className="themed-view">{children}</div>
    ),
  };
});

it('renders HomeScreen correctly', () => {
  const tree = renderer.create(<HomeScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
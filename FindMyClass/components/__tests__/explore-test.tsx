
import * as React from 'react';
import renderer from 'react-test-renderer';
import { Explore } from '../Explore'; // Update import path

it(`renders correctly`, () => {
  const tree = renderer.create(<Explore>Snapshot test!</Explore>).toJSON();

  expect(tree).toMatchSnapshot();
});
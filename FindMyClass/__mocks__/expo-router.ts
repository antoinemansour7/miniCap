export const Link = ({ children }) => children;
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
});
export const Tabs = ({ children }) => children;
export const Stack = ({ children }) => children;

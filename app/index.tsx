import Welcome from './welcome';

function Index() {
  return <Welcome />;
}

// Add proper named export with displayName for React DevTools
Index.displayName = 'Index';

export default Index;

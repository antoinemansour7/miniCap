import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext'; 
import { Text, Button } from 'react-native'; 

const TestComponent = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <React.Fragment>
      <Text>{t.settings}</Text> 
      <Button onPress={toggleLanguage} title="Toggle Language" />
    </React.Fragment>
  );
};

describe('LanguageProvider', () => {
  it('should render the default language (English)', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );


    expect(screen.getByText('Settings')).toBeTruthy(); 
  });

  it('should switch to French when toggleLanguage is called', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByText('Settings')).toBeTruthy();

    fireEvent.press(screen.getByText('Toggle Language'));

    expect(screen.getByText('Paramètres')).toBeTruthy();
  });

  it('should toggle back to English when clicked again', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByText('Settings')).toBeTruthy();

    fireEvent.press(screen.getByText('Toggle Language'));
    expect(screen.getByText('Paramètres')).toBeTruthy();

    fireEvent.press(screen.getByText('Toggle Language'));
    expect(screen.getByText('Settings')).toBeTruthy();
  });
});

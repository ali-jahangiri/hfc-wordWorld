import React from 'react';
import ReactDOM from 'react-dom';
import TextEditor from './TextEditor';
import TextEditorProvider from './TextEditorProvider';

ReactDOM.render(
  <React.StrictMode>
    <TextEditorProvider>
      <TextEditor />
    </TextEditorProvider>
  </React.StrictMode>,
  document.getElementById('root')
);


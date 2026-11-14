import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

// Configure @monaco-editor/react to use local offline monaco-editor bundle
// Zero external network / CDN requests!
loader.config({ monaco });

export default monaco;


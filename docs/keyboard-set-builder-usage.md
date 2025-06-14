# Keyboard Set Builder Usage Guide

## Overview
The KeyboardSetBuilder component provides a natural and fast keyboard input system for entering set expressions in the Venn diagram visualization.

## Key Features

### 1. Smart Symbol Conversion
Type these characters to automatically insert set operation symbols:
- `u` or `U` → `∪` (union)
- `n`, `N`, `i`, or `I` → `∩` (intersection)  
- `'` → `'` (complement)
- `e`, `E`, or `0` → `∅` (empty set)

### 2. Auto-Complete Parentheses
When you type `(`, it automatically inserts `)` and positions the cursor between them.

### 3. Context-Aware Validation
- Prevents double operators (e.g., `∪∪`)
- Prevents operators at the beginning (except complement)
- Ensures complement only follows valid sets or expressions

### 4. Keyboard Navigation
- **Arrow keys**: Move cursor left/right
- **Home/End**: Jump to beginning/end
- **Backspace**: Delete before cursor
- **Delete**: Delete after cursor
- **Enter**: Evaluate expression
- **Escape**: Clear input

### 5. Autocomplete Suggestions
- **Ctrl/Cmd + Space**: Show/hide suggestions
- **Arrow Up/Down**: Navigate suggestions
- **Enter/Tab**: Accept selected suggestion
- **Escape**: Cancel suggestions

## Usage Examples

### Basic Set Operations
1. Type `AuB` → displays `A∪B`
2. Type `AnB` → displays `A∩B`
3. Type `A'` → displays `A'`

### Complex Expressions
1. Type `(AuB)nC` → displays `(A∪B)∩C`
2. Type `A'nB'` → displays `A'∩B'`
3. Type `(AuB)'` → displays `(A∪B)'`

### Using Autocomplete
1. Type `A` then press `Ctrl+Space`
2. Suggestions appear: `∪`, `∩`, `'`
3. Use arrow keys to select
4. Press Enter to insert

## Integration Example

```jsx
import { KeyboardSetBuilder } from './KeyboardSetBuilder';

function MyComponent() {
  const [expression, setExpression] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate and process expression
    try {
      const result = parseSetNotation(expression);
      // Handle result
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <KeyboardSetBuilder
      value={expression}
      onChange={setExpression}
      onSubmit={handleSubmit}
      onDelete={() => setExpression(prev => prev.slice(0, -1))}
      onReset={() => setExpression('')}
      errorMessage={error}
    />
  );
}
```

## Keyboard Shortcuts Reference

| Key | Action | Context |
|-----|--------|---------|
| `u`, `U` | Insert ∪ | Anywhere |
| `n`, `N`, `i`, `I` | Insert ∩ | Anywhere |
| `'` | Insert complement | After set or ) |
| `e`, `E`, `0` | Insert ∅ | Anywhere |
| `Enter` | Evaluate | No suggestions shown |
| `Escape` | Clear input | No suggestions shown |
| `Ctrl/Cmd + Space` | Toggle suggestions | Anywhere |
| `↑`, `↓` | Navigate suggestions | Suggestions shown |
| `Tab` | Accept suggestion | Suggestions shown |
| `(` | Insert () with cursor inside | Anywhere |

## Design Decisions

### Why 'i' for intersection?
While 'n' is used for intersection (∩), we also support 'i' as it's more intuitive for English speakers ("intersection" starts with 'i').

### Why not 'c' for complement?
We use the apostrophe (') for complement as it's the standard mathematical notation and avoids confusion with set C.

### Multi-character conversion (future enhancement)
The system is designed to support typing words like "union" or "intersection" and converting them automatically, though this feature can be toggled on/off.

## Accessibility
- Full keyboard navigation support
- Clear visual feedback for all actions
- Screen reader compatible with ARIA labels
- High contrast cursor for visibility
# Educational MDX Components

This directory contains reusable components designed to make educational content creation easier and more maintainable.

## Why This Approach?

Instead of writing repetitive HTML/JSX in MDX files, you can use semantic components that:
- Ensure consistent styling across all content
- Make content easier to write and read
- Allow global style changes from one place
- Reduce errors and typos
- Speed up content creation

## Available Components

### BulletList
For creating styled bullet lists with different colors and icons.

```jsx
<BulletList 
  color="blue"      // blue, purple, green, orange, teal, red
  icon="bullet"     // bullet, arrow, check, dash, star
  spacing="md"      // sm, md, lg
>
  <li>First item with $\LaTeX$ support</li>
  <li>Second item</li>
  <li>Third item</li>
</BulletList>
```

### Definition
For mathematical or technical definitions.

```jsx
<Definition term="Sample Space">
  A sample space $S$ is the set of all possible outcomes of a random experiment.
</Definition>
```

### ExampleBlock
For examples with colored borders.

```jsx
<ExampleBlock 
  color="blue"
  title="Union ($A \cup B$)"
  description="Either A or B occurs"
>
  Example: $\{2, 4, 6\} \cup \{1, 2\} = \{1, 2, 4, 6\}$
</ExampleBlock>
```

### KeyTakeaways
For summarizing important points.

```jsx
<KeyTakeaways title="Key Points">  // title is optional
  <li>First key point</li>
  <li>Second key point</li>
  <li>Third key point</li>
</KeyTakeaways>
```

### PageHeader
For consistent page titles.

```jsx
<PageHeader 
  title="Sample Spaces and Events"
  subtitle="Chapter 1, Section 1"
  centered={true}  // optional, defaults to true
/>
```

### Concept
For introducing new concepts with an icon.

```jsx
<Concept title="Events" icon="🎯">
  An event is any subset of the sample space.
</Concept>
```

### Alert
For important notes, warnings, or tips.

```jsx
<Alert type="info">      // info, warning, error, success
  Important information goes here.
</Alert>
```

## Usage in MDX

1. Import the components you need:
```jsx
import { BulletList, Definition, ExampleBlock } from '../components/mdx/educational-components';
```

2. Use them in your content:
```mdx
<Definition term="Probability">
  A measure of the likelihood that an event will occur.
</Definition>

<BulletList color="blue">
  <li>First point</li>
  <li>Second point</li>
</BulletList>
```

## Adding New Components

To add a new component:
1. Create a new file in this directory
2. Export it from `index.js`
3. Follow the existing patterns for consistency

## Benefits

1. **Consistency**: All lists, definitions, etc. look the same across the site
2. **Maintainability**: Change styles in one place
3. **Readability**: MDX files are cleaner and easier to understand
4. **Speed**: Faster to write new content
5. **Type Safety**: Props help prevent errors
6. **Flexibility**: Easy to add new variants or styles
import './ContentEditable.css'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import * as React from 'react'

interface LexicalContentEditableProps {
  ariaActiveDescendant?: string
  ariaAutoComplete?: string
  ariaControls?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaMultiline?: boolean
  ariaOwns?: string
  ariaRequired?: boolean
  autoCapitalize?: string
  className?: string
  id?: string
  role?: string
  spellCheck?: boolean
  style?: React.CSSProperties
  tabIndex?: number
  'data-testid'?: string
}

export default function LexicalContentEditable({
  ariaActiveDescendant,
  ariaAutoComplete,
  ariaControls,
  ariaDescribedBy,
  ariaExpanded,
  ariaLabel,
  ariaLabelledBy,
  ariaMultiline,
  ariaOwns,
  ariaRequired,
  autoCapitalize,
  className,
  id,
  role,
  spellCheck,
  style,
  tabIndex,
  'data-testid': testid,
}: LexicalContentEditableProps): JSX.Element {
  return (
    <ContentEditable
      ariaActiveDescendant={ariaActiveDescendant}
      ariaControls={ariaControls}
      ariaDescribedBy={ariaDescribedBy}
      ariaExpanded={ariaExpanded}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      ariaMultiline={ariaMultiline}
      ariaOwns={ariaOwns}
      ariaRequired={ariaRequired}
      autoCapitalize={autoCapitalize}
      className={className || 'ContentEditable__root'}
      id={id || 'ContentEditable__root'}
      role={role}
      spellCheck={spellCheck}
      style={style}
      tabIndex={tabIndex}
      data-testid={testid}
    />
  )
}

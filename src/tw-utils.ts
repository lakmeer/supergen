//@ts-nocheck

//
// Use Tailwind colors by name
//

const { floor, random } = Math
const randomFrom = <T>(xs:T[]):T => xs[floor(random() * xs.length)]

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";
const theme = resolveConfig(tailwindConfig)?.theme

export const fromTw = (tag:string):string => {
  if (!theme) return tag
  if (!theme.colors) return tag
  if (tag.match(/-\d\d\d?$/)) {
    const [ name, n ] = tag.split('-')
    if (!theme.colors[name]) return console.warn("Unknown color:", tag)
    return theme.colors[name][n]
  } else {
    if (!theme.colors[tag]) return console.warn("Unknown color:", tag)
    return theme.colors[tag]
  }
  return tag
}

const excludedKeys = [
  'fore',
  'back',
  'motat',
  'transparent',
  'current',
  'inherit',
  'black',
  'white',
  'neutral',
  'stone',
  'slate',
]

const twColors = Object.keys(theme.colors).filter(name => !excludedKeys.includes(name))

export const randomTwColor = () => theme?.colors[randomFrom(twColors)]['500'] ?? 'white'

export const iterColors = Object.keys(theme.colors).map(name => theme.colors[name]['500'])

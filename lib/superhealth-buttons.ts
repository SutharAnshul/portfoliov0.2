/**
 * Real button variants, rendered out of the Figma file.
 *
 * Not a reconstruction: the gradient and its angle, the corner radius, the
 * auto-layout padding, the label typography and the variable bound to the
 * label colour are all read from the recorded geometry. The gradient angle is
 * derived by inverting Figma's gradient transform, which maps object space
 * into the space the ramp runs across.
 */

export interface ButtonVariant {
  name: string
  props: Record<string, string>
  w: number
  h: number
  radius: number
  padX: number | null
  padY: number | null
  gap: number | null
  background: string
  backgroundKind: string
  border: string | null
  shadow: string | null
  label: {
    text: string
    size: number | null
    family: string | null
    style: string | null
    color: string
    lineHeight: number | null
    letterSpacing: number | null
  } | null
  bindings: { prop: string; token: string }[]
}

export const buttons: ButtonVariant[] = [
 {
  "name": "Type=Secondary, State=Default, Size=Large, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Default",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#2F2F2F",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Default, Size=Large, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Default",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#2F2F2F",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Hover, Size=Large, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Hover",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#232323",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Hover, Size=Large, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Hover",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#232323",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Active, Size=Large, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Active",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Active, Size=Large, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Active",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Disabled, Size=Large, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Disabled",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#979797",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Default, Size=Large, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Default",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #1F30A0 0%, #914BFA 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Hover, Size=Large, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Hover",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #192785 0%, #7B3FD4 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Hover, Size=Large, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Hover",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #192785 0%, #7B3FD4 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Active, Size=Large, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Active",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #141F68 0%, #5F31A4 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Active, Size=Large, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Active",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #141F68 0%, #5F31A4 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Default, Size=Large, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Default",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #1F30A0 0%, #914BFA 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Disabled, Size=Large, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Disabled",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #8F98CF 0%, #C8A5FD 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 14,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.2000000476837158,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Default, Size=Large, Focused=False",
  "props": {
   "Type": "Hero",
   "State": "Default",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Active, Size=Large, Focused=False",
  "props": {
   "Type": "Hero",
   "State": "Active",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#1C1C1C",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Default, Size=Large, Focused=True",
  "props": {
   "Type": "Hero",
   "State": "Default",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Hover, Size=Large, Focused=True",
  "props": {
   "Type": "Hero",
   "State": "Hover",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#262626",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   },
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Active, Size=Large, Focused=True",
  "props": {
   "Type": "Hero",
   "State": "Active",
   "Size": "Large",
   "Focused": "True"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#1C1C1C",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Hover, Size=Large, Focused=False",
  "props": {
   "Type": "Hero",
   "State": "Hover",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#262626",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Hero, State=Disabled, Size=Large, Focused=False",
  "props": {
   "Type": "Hero",
   "State": "Disabled",
   "Size": "Large",
   "Focused": "False"
  },
  "w": 345,
  "h": 48,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#808080",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Button",
   "size": 16,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "color",
    "token": "Colours/Solid/White"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Default, Size=Small, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Default",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 8,
  "padY": 8,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #1F30A0 0%, #914BFA 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Primary, State=Hover, Size=Small, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Hover",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #192785 0%, #7B3FD4 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Primary, State=Active, Size=Small, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Active",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #141F68 0%, #5F31A4 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Primary, State=Default, Size=Small, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Default",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #1F30A0 0%, #914BFA 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Hover, Size=Small, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Hover",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #192785 0%, #7B3FD4 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Active, Size=Small, Focused=True",
  "props": {
   "Type": "Primary",
   "State": "Active",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #141F68 0%, #5F31A4 100%)",
  "backgroundKind": "gradient",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Primary, State=Disabled, Size=Small, Focused=False",
  "props": {
   "Type": "Primary",
   "State": "Disabled",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "linear-gradient(309.6deg, #8F98CF 0%, #C8A5FD 100%)",
  "backgroundKind": "gradient",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Secondary, State=Default, Size=Small, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Default",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 8,
  "padY": 8,
  "gap": 10,
  "background": "#2F2F2F",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Secondary, State=Hover, Size=Small, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Hover",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#232323",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Secondary, State=Active, Size=Small, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Active",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 },
 {
  "name": "Type=Secondary, State=Default, Size=Small, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Default",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#2F2F2F",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Hover, Size=Small, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Hover",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#232323",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Active, Size=Small, Focused=True",
  "props": {
   "Type": "Secondary",
   "State": "Active",
   "Size": "Small",
   "Focused": "True"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#000000",
  "backgroundKind": "solid",
  "border": "4px solid #AFD6FF",
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": [
   {
    "prop": "border",
    "token": "Stroke/Focused"
   }
  ]
 },
 {
  "name": "Type=Secondary, State=Disabled, Size=Small, Focused=False",
  "props": {
   "Type": "Secondary",
   "State": "Disabled",
   "Size": "Small",
   "Focused": "False"
  },
  "w": 157,
  "h": 32,
  "radius": 8,
  "padX": 16,
  "padY": 12,
  "gap": 10,
  "background": "#979797",
  "backgroundKind": "solid",
  "border": null,
  "shadow": null,
  "label": {
   "text": "Reschedule",
   "size": 12,
   "family": "Graphik Web",
   "style": "Regular",
   "color": "#FFFFFF",
   "lineHeight": 1.399999976158142,
   "letterSpacing": -0.02
  },
  "bindings": []
 }
]

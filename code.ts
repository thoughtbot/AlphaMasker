async function createScribble(node) {
  // Copy image of incoming frame, store as image
  let t = await node.exportAsync()
  let newImage = figma.createImage(t)

  // Create a rect to fill with stored image
  let image = figma.createRectangle()
  image.fills = [ { type: "IMAGE", scaleMode: "FIT", imageHash: newImage.hash } ]

  // Create the parent frame and remove fill
  let f = figma.createFrame()
  f.fills = []

  // Create a rectangle to serve as fill color
  let rect = figma.createRectangle()

  // Resize and position frame to same place as selection
  f.x = node.x
  f.y = node.y
  f.resize(node.width, node.height)

  // Move incoming frame and rect into parent frame
  f.appendChild(image)
  f.appendChild(rect)

  // Place image mask and fill rect at origin of container frame, resize to fit
  // the frame
  image.x = 0
  image.y = 0
  rect.x = 0
  rect.y = 0
  rect.resize(f.width, f.height)
  image.resize(f.width, f.height)

  // Set new constraints
  let newConstraints = { ...node.constraints, horizontal: "SCALE", vertical: "SCALE" }
  image.constraints = newConstraints
  rect.constraints = newConstraints

  // Set image mask to be a mask
  image.isMask = true

  // Name the layers
  image.name = "PNG Mask"
  rect.name = "Fill Color"

  // Remove the original node
  node.remove()
}

// Get the current selection
let s = figma.currentPage.selection

if (s.length === 0) {
  figma.notify("Select at least one node.")
} else if (s.some((node) => node.type === "COMPONENT")) {
  figma.notify("Can't operate on base components.")
} else {
  // Make a scribble!
  s.forEach(node => createScribble(node))
}

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin()

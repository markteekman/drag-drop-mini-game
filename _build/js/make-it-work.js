// ========================
// Variables
// ========================

const draggables = document.querySelectorAll('[data-draggable]')
const totalNumberOfBoxes = [...document.querySelector('[data-pickzone]').children]
const succesMessage = document.querySelector('.success')

// ========================
// Functions
// ========================

// check for dropzone
const getDropzone = element => {
  const { top, left } = element.getBoundingClientRect()
  const hitTest = document.elementFromPoint(left, top)
  return hitTest.closest('[data-dropzone]')
}

// get the current preview position
function getCurrentPreviewPosition (dropzone, preview) {
  return [...dropzone.children].findIndex(element => {
    return element === preview
  })
}

// get the desired preview position
function getDesiredPreviewPosition (dropzone, element) {
  const { left, top } = element.getBoundingClientRect()

  const positions = [...dropzone.children]
    .map(element => element.getBoundingClientRect())

  return positions.findIndex(pos => {
    return (pos.left < left && left < pos.right) &&
      (pos.top < top && top < pos.bottom)
  })
}

// ========================
// Execution
// ========================

// fix for chromium based browsers on android
draggables.forEach(draggable => {
  draggable.addEventListener('touchstart', event => {
    event.preventDefault()
  })
})

// add pointerevent to all draggables
draggables.forEach(draggable => {
  draggable.addEventListener('pointerdown', event => {
    event.preventDefault()

    const target = event.target
    const box = target.getBoundingClientRect()
    let prevScreenX = event.screenX
    let prevScreenY = event.screenY

    const preview = target.cloneNode()
    preview.classList.add('preview')
    target.before(preview)

    document.body.append(target)
    target.dataset.dragging = true

    target.style.left = `${box.left}px`
    target.style.top = `${box.top}px`
    target.style.width = `${box.width}px`
    target.style.height = `${box.height}px`

    target.setPointerCapture(event.pointerId)
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)

    // start event when the user moxes a box
    function move (event) {
      // get movementX and movementY to calculate amount the mouse moves
      const movementX = event.screenX - prevScreenX
      const movementY = event.screenY - prevScreenY
      prevScreenX = event.screenX
      prevScreenY = event.screenY

      // change position of target element
      const left = parseFloat(target.style.left)
      const top = parseFloat(target.style.top)
      target.style.left = `${left + movementX}px`
      target.style.top = `${top + movementY}px`

      // detect dropzone
      const dropzone = getDropzone(target)
      if (!dropzone) return

      // add preview into dropzone if it's not there
      let previewPos = getCurrentPreviewPosition(dropzone, preview)
      if (previewPos === -1) {
        dropzone.append(preview)
        previewPos = dropzone.children.length - 1
      }

      // switch preview to desired position
      const position = getDesiredPreviewPosition(dropzone, target)
      if (position === -1) return

      const elem = dropzone.children[position]
      if (position > previewPos) {
        elem.after(preview)
      } else {
        elem.before(preview)
      }
    }

    // start event when the user droppes a box
    function up (event) {
      // remove other pointer events
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      target.releasePointerCapture(event.pointerId)

      target.dataset.dragging = false

      preview.before(target)
      preview.remove()

      // select all boxes in de dropzone
      const currentDropzoneBoxes = [...document.querySelector('[data-dropzone]').children]

      // check to see if all the boxes are dropped in the dropzone
      if (currentDropzoneBoxes.length === totalNumberOfBoxes.length) {
        // set the starting winning number
        let winningNumber = 1

        // loop through all the items and check whether they are on the right position
        for (let i = 1; i < currentDropzoneBoxes.length + 1; i++) {
          const currentBox = currentDropzoneBoxes[i - 1]
          const currentBoxPosition = currentDropzoneBoxes.indexOf(currentBox) + 1
          const currentBoxNumber = parseInt(currentBox.getAttribute('data-number'))

          // if the position is correct add one to the winning number
          if (currentBoxPosition === currentBoxNumber) winningNumber++

          // if the winning number matches the number of boxes then complete the game
          if (winningNumber === currentDropzoneBoxes.length) succesMessage.classList.add('show')
        }
      }
    }
  })
})

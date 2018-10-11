function log (message, error) {
  if (error) {
    console.error(`[E] ${message}`)
    console.log('')
    console.error(error)
    console.log('')
  } else {
    console.log(`[I] ${message}`)
  }
}

module.exports = log

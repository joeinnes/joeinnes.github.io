require('whatwg-fetch') // Monkey-patch global environment with fetch

const baseUrl = 'https://joeinn.es/'
window.fetch('projects.json')
  .then((data) => data.json())
  .then((data) => {
    Promise.all(data.map((item) => {
      return new Promise((resolve, reject) => {
        window.fetch('https://joeinn.es/' + item + '/project.json')
          .then((data) => {
            if (data.status === 200) {
              return data.json()
            } else {
              return null
            }
          })
          .then((data) => {
            if (data) {
              let newStory = createCard(data, baseUrl + item)
              resolve(newStory)
            } else {
              resolve()
            }
          })
          .catch((err) => {
            console.error(err)
            resolve()
          })
      })
    }))
      .then((data) => {
        let projects = data.filter((item) => item !== undefined)
        projects.forEach((item) => {
          document.getElementById('portfolio').appendChild(item)
        })
        document.getElementById('loading').style.display = 'none'
      })
      .catch((err) => {
        console.error('Something went terribly wrong: ' + err)
      })
  })
  .catch((err) => {
    console.error('Something went terribly wrong: ' + err)
  })

function createCard (data, url) {
  let card = document.createElement('div')
  card.classList.add('fl', 'w-100', 'w-50-ns')

  let article = document.createElement('article')
  article.classList.add('pa1', 'pa3-ns', 'f5', 'f4-ns')

  let title = document.createElement('h2')
  title.classList.add('f2')
  title.innerText = data.title

  let link = document.createElement('a')
  link.classList.add('link')
  link.href = url

  let img = document.createElement('img')
  img.classList.add('w-100', 'f5', 'f4-ns', 'measure', 'grow')
  img.src = url + '/' + data.image
  img.alt = 'Screenshot of ' + data.title

  link.appendChild(img)

  let summary = document.createElement('p')
  summary.classList.add('measure', 'lh-copy')
  summary.innerText = data.summary

  let techSection = document.createElement('section')
  let techSectionHeader = document.createElement('h3')
  techSectionHeader.innerText = 'Built using:'

  let techList = document.createElement('ul')
  techList.classList.add('list', 'pl0')
  let techStack = data.technologies_used.sort((a, b) => a > b)
  techStack.forEach((tech) => {
    let thisTech = document.createElement('li')
    thisTech.innerHTML = tech
    techList.appendChild(thisTech)
  })

  techSection.appendChild(techSectionHeader)
  techSection.appendChild(techList)

  let creditSection = document.createElement('section')
  let creditSectionHeader = document.createElement('h3')
  creditSectionHeader.innerText = 'With thanks to'
  let creditsList = document.createElement('section')
  let creds = data.credits.sort((a, b) => a.name > b.name)
  creds.forEach((credit) => {
    let link = document.createElement('a')
    link.classList.add('link', 'b', 'no-underline', 'black', 'dib', 'pr3', 'hover-' + randomColour())
    link.href = credit.link
    link.innerText = credit.name
    creditsList.appendChild(link)
  })

  creditSection.appendChild(creditSectionHeader)
  creditSection.appendChild(creditsList)

  article.appendChild(title)
  article.appendChild(link)
  article.appendChild(summary)
  article.appendChild(techSection)
  article.appendChild(creditSection)
  card.appendChild(article)

  return card
}

function randomColour () {
  let colours = [
    'dark-red',
    'red',
    'orange',
    'gold',
    'yellow',
    'purple',
    'light-purple',
    'hot-pink',
    'dark-pink',
    'pink',
    'dark-green',
    'green',
    'navy',
    'dark-blue',
    'blue',
    'light-blue'
  ]
  return colours[Math.floor(Math.random() * colours.length)]
}

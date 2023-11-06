let token = ""
let button = ""
const hotel = {
  outgoingIata: [],
  destinationIata: [],
  name: [],
  radius: [],
  rating: []
}
const userInput = {
  city: "",
  region: "",
  radius: 5 - 1 // !recommended 5 mi (prevent 100+ hotel list)
}

const savedItems = {
  hotel: [],
  flight: {
    departure: "",
    arrival: "",
    return: "",
    returnArrival: "",
    airline: "",
    cost: "",
    passengers: ""
  }
}

function searchIataCode() {
  hotel.outgoingIata = []
  hotel.destinationIata = []
  $(".error-msg").css("display", "none")
  hotel.iata = []
  userInput.city = $("#outgoing-city")[0].value
  userInput.region = $("#outgoing-state")[0].value

  const requestUrl = "https://api.api-ninjas.com/v1/airports?city=" + userInput.city + "&region=" + userInput.region
  fetch(requestUrl, {
    method: "GET",
    headers: { "X-Api-Key": "y+Klmvc+pjWsfHoKkI2OSA==h5DjimMBO5bvqGQp" }
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      // console.log(data)
      for (i = 0; i < data.length; i++) {
        if (data[i].iata != "") {
          hotel.outgoingIata.push(data[i].iata)
        }
      }
      searchDestinationIataCode()
    })
}

function searchDestinationIataCode() {
  $(".error-msg").css("display", "none")
  hotel.iata = []
  userInput.city = $("#destination-city")[0].value
  userInput.region = $("#destination-state")[0].value

  const requestUrl = "https://api.api-ninjas.com/v1/airports?city=" + userInput.city + "&region=" + userInput.region
  fetch(requestUrl, {
    method: "GET",
    headers: { "X-Api-Key": "y+Klmvc+pjWsfHoKkI2OSA==h5DjimMBO5bvqGQp" }
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      // console.log(data)
      for (i = 0; i < data.length; i++) {
        if (data[i].iata != "") {
          hotel.destinationIata.push(data[i].iata)
        }
      }
      getHotelToken()
    })
}

$(".search-button").click(searchIataCode)

let index = 0
// flight object for API Flight Info
let flights = {
  departTime: [],
  arrivalTime: [],
  returnDepartTime: [],
  returnArrivalTime: [],
  departAirline: [],
  returnAirline: [],
  departFlightNumber: [],
  returnFlightNumber: [],
  numPassengers: [],
  cost: []
}
function getHotelToken() {
  const requestTokenURL = "https://test.api.amadeus.com/v1/security/oauth2/token"
  fetch(requestTokenURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&client_id=guryqLQUIRoKA4EyXNaj5uAeyAG1pG22&client_secret=byRpyX39LG4bx9Ap'
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      token = data.access_token
      hotelSearch()
      flightSearch()
    })
}

function hotelSearch() {
  let iataCode = hotel.destinationIata[index]
  const hotelUrl = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=" + iataCode + "&radius=" + userInput.radius + "&radiusUnit=MILE" + "&ratings=5,4,3,2"
  fetch(hotelUrl, {
    method: "GET",
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {
      console.log(data)
      createHotelList(data)
    })
    .catch(error => {
      if (iataCode != undefined) {
        index += 1
        hotelSearch()
      } else {
        $(".error-msg").css("display", "block")
      }
    })
}

// variables for creating dynamic url flight search
let $departDateInput = $('#outgoing-date');
let $returnDateInput = $('#return-date');
let $adultPassengerInput = $('#passengers');

// Flight Search Function
function flightSearch() {
  iataCode = hotel.outgoingIata[index]
  iataCodeDestination = hotel.destinationIata[index]

  // Variable for the ID's set above grabbing the user input form the IDs for the dynamic url
  let departDate = $departDateInput.val();
  let returnDate = $returnDateInput.val();
  let adult = $adultPassengerInput.val();
  
  const flightUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=" + iataCode + "&destinationLocationCode=" + iataCodeDestination + "&departureDate=" + departDate + "&returnDate=" + returnDate + "&adults=" + adult + "&nonStop=true&currencyCode=USD"
  // using fetch to grab API search values
  fetch(flightUrl, {
    method: "GET",
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .catch(error => {
    if (iataCode != undefined) {
      index += 1
      flightSearch()
    }
    if (error) {
      console.log("error found")
      index += 1
      flightSearch()
    }
  })
  .then(function (response) {
    return response.json()
  })
  // assigning variabl to the IDs of the search form
  .then(function (data) {
    console.log(data)
    let departure = $(".departure")
    let arrival = $(".arrival")
    let returnTime = $(".return")
    let returnArrival = $(".return-arrival")
    let airline = $(".airline")
    let cost = $(".cost")
    let passengers = $(".passengers")
    let button = $(".select-flight")

    // start of loop to iterate through the api
    for (i = 0;i < data.meta.count; i++) {
      // assinging constant variable to the elements created for the values parsed in the api
      const createDt = document.createElement("p")
      const createAt = document.createElement("p")
      const createRdt = document.createElement("p")
      const createRat = document.createElement("p")
      const createA = document.createElement("p")
      const createC = document.createElement("p")
      const createNp = document.createElement("p")
      const createButton = document.createElement("button")

      
      // values for depatrure date and time
      let departString = data.data[i].itineraries[0].segments[0].departure.at
      departString = departString.replace("T", " ")
      // converstion from 24 hour to 12 hour time format
      let convertTimeDepart = new Date(departString)
      let monthDepart = convertTimeDepart.getMonth();
      let dayDepart = convertTimeDepart.getDate();
      let yearDepart = convertTimeDepart.getFullYear();
      monthDepart += 1
      let dateDepart = yearDepart + "-" + monthDepart + "-" + dayDepart + " ";
      let hoursDepart = convertTimeDepart.getHours();
      let minutesDepart = convertTimeDepart.getMinutes();
      let convertedTimeDepart = dateDepart + ((hoursDepart > 12) ? hoursDepart - 12 :hoursDepart)
      convertedTimeDepart += ((minutesDepart < 10) ? ":00":":" + minutesDepart)
      convertedTimeDepart += ((hoursDepart >= 12) ? " PM":" AM")
      flights.departTime.push(convertedTimeDepart)

      let arrivalString = data.data[i].itineraries[0].segments[0].arrival.at
      arrivalString = arrivalString.replace("T", " ")
      // console.log(arrivalString)
      let convertTimeArrival = new Date(arrivalString)
      let monthArrival = convertTimeArrival.getMonth();
      let dayArrival = convertTimeArrival.getDate();
      let yearArrival = convertTimeArrival.getFullYear();
      monthArrival += 1;
      let dateArrival = yearArrival + "-" + monthArrival + "-" + dayArrival + " ";
      let hoursArrival = convertTimeArrival.getHours();
      let minutesArrival = convertTimeArrival.getMinutes();
      let convertedTimeArrival = dateArrival + ((hoursArrival > 12) ? hoursArrival - 12 :hoursArrival)
      convertedTimeArrival += ((minutesArrival< 10) ? ":00":":" + minutesArrival)
      convertedTimeArrival += ((hoursArrival >= 12) ? " PM":" AM")
      flights.arrivalTime.push(convertedTimeArrival)

      let returnDepartString = data.data[i].itineraries[1].segments[0].departure.at
      returnDepartString = returnDepartString.replace("T", " ")
      let convertTimeReturnD = new Date(returnDepartString)
      let monthReturnD = convertTimeReturnD.getMonth();
      let dayReturnD = convertTimeReturnD.getDate();
      let yearReturnD = convertTimeReturnD.getFullYear();
      monthReturnD += 1;
      let dateReturnD = yearReturnD + "-" + monthReturnD + "-" + dayReturnD + " ";
      let hoursReturnD = convertTimeReturnD.getHours();
      let minutesReturnD = convertTimeReturnD.getMinutes();
      let convertedTimeReturnD = dateReturnD + ((hoursReturnD > 12) ? hoursReturnD - 12 :hoursReturnD)
      convertedTimeReturnD += ((minutesReturnD< 10) ? ":00":":" + minutesReturnD)
      convertedTimeReturnD += ((hoursReturnD >= 12) ? " PM":" AM")
      flights.returnDepartTime.push(convertedTimeReturnD)

      let returnArrivalString = data.data[i].itineraries[1].segments[0].arrival.at
      returnArrivalString = returnArrivalString.replace("T", " ")
      let convertTimeReturnA = new Date(returnArrivalString)
      let monthReturnA = convertTimeReturnA.getMonth();
      let dayReturnA = convertTimeReturnA.getDate();
      let yearReturnA = convertTimeReturnA.getFullYear();
      monthReturnA += 1;
      let dateReturnA = yearReturnA + "-" + monthReturnA + "-" + dayReturnA + " ";
      let hoursReturnA = convertTimeReturnA.getHours();
      let minutesReturnA = convertTimeReturnA.getMinutes();
      let convertedTimeReturnA = dateReturnA + ((hoursReturnA > 12) ? hoursReturnA - 12 :hoursReturnA)
      convertedTimeReturnA += ((minutesReturnA< 10) ? ":00":":" + minutesReturnA)
      convertedTimeReturnA += ((hoursReturnA >= 12) ? " PM":" AM")
      flights.returnArrivalTime.push(convertedTimeReturnA)

      // values for rest of parsed data
      flights.departAirline.push(data.data[i].itineraries[0].segments[0].carrierCode)
      flights.returnAirline.push(data.data[i].itineraries[1].segments[0].carrierCode)
      flights.departFlightNumber.push(data.data[i].itineraries[0].segments[0].number)
      flights.returnFlightNumber.push(data.data[i].itineraries[1].segments[0].number)
      flights.cost.push(data.data[i].price.total)
      flights.numPassengers.push(data.data[i].travelerPricings.length)

      // make the values text and appending to the created element
      createDt.textContent = flights.departTime[i]
      departure.append(createDt)

      createAt.textContent = flights.arrivalTime[i]
      arrival.append(createAt)

      createRdt.textContent = flights.returnDepartTime[i]
      returnTime.append(createRdt)

      createRat.textContent = flights.returnArrivalTime[i]
      returnArrival.append(createRat)

      createA.textContent = flights.departAirline[i]
      airline.append(createA)

      createC.textContent = "$" + flights.cost[i] + " USD"
      cost.append(createC)

      createNp.textContent = flights.numPassengers[i]
      passengers.append(createNp)
      
      createButton.textContent = "Select Flight"
      createButton.setAttribute("id", i)
      button.append(createButton)
    }

    // if statement for error handling if flight are not available
    if (data.data.length === 0) {
      $(".error-msg2").css("display", "block")
    }

    // function for clicking search button, save values to local storage, continue to hotel html page
    $("button[id]").click(function () {
      let id = this.id
      savedItems.flight.departure = flights.departTime[id]
      savedItems.flight.arrival = flights.arrivalTime[id]
      savedItems.flight.return = flights.returnDepartTime[id]
      savedItems.flight.returnArrival = flights.returnArrivalTime[id]
      savedItems.flight.airline = flights.departAirline[id]
      savedItems.flight.cost = flights.cost[id]
      savedItems.flight.passengers = flights.numPassengers[id]
      console.log(savedItems)
      localStorage.setItem("savedTrips", JSON.stringify(savedItems))
      window.location.href = "page2.html"
    })
  })
}

function createHotelList(data) {
  const hotelList = $("#results-list") // !jquery to the hotel list div
  for (i = 0; i < data.data.length; i++) {
    const createDiv = document.createElement("div")
    const createHeader = document.createElement("h1")
    const createPara = document.createElement("p")
    const createStar = document.createElement("p")
    const saveButton = document.createElement("button")

    // create a hotel div for each returned hotel
    createDiv.setAttribute("class", "hotel")
    hotelList.append(createDiv)

    // add rating stars
    let ratingString = ""
    let x = 0
    while (x < data.data[i].rating) {
      ratingString += "★"
      x++
    }

    if (x < 5) {
      while (x < 5) {
        ratingString += "☆"
        x++
      }
    }

    // add each hotel value to its respective key
    hotel.name.push(data.data[i].name)
    hotel.radius.push(data.data[i].distance.value + " Mi")
    hotel.rating.push(ratingString + " Stars")

    // append each hotel element to a hotel div
    createHeader.textContent = hotel.name[i]
    hotelList.children().eq(i).append(createHeader)
    createPara.textContent = hotel.radius[i]
    hotelList.children().eq(i).append(createPara)
    createStar.textContent = hotel.rating[i]
    hotelList.children().eq(i).append(createStar)

    // append save button to each div
    saveButton.textContent = "💾 Save"
    saveButton.setAttribute("id", i)
    hotelList.children().eq(i).append(saveButton)
  }
  $("button[id]").click(function () {
    let id = this.id
    savedItems.hotel.push(hotel.name[this.id])
    hideButton(id)
    console.log(savedItems)
  })
}

function hideButton(id) {
  const hotelList = $(".results-list")
  const createPara = document.createElement("p")

  document.getElementById(id).style.display = "none"
  createPara.textContent = "Saved"
  createPara.setAttribute("class", "saved")
  hotelList.children().eq(id).append(createPara)
  $(".saved").css("font-style", "italic")

  localStorage.setItem("savedTrips", JSON.stringify(savedItems))
}

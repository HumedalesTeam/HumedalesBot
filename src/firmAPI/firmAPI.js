import fetch from "node-fetch"

async function getData() {
  let date = new Date()
  const today = date.toISOString().split("T")[0]
  const url =
    "https://firms.modaps.eosdis.nasa.gov/api/country/csv/01dbe567da924b7f4f01780a6615ef11/VIIRS_SNPP_NRT/ARG/1/" +
    today

  let today_data
  await fetch(url)
    .then((res) => res.text())
    .then((text) => {
      today_data = text
      console.log(typeof today_data)
    })
    .catch((err) => console.log(err))
  console.log(typeof today_data)
}

getData()

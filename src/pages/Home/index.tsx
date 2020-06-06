import React, { useState, useEffect, ChangeEvent } from 'react'
import axios from 'axios'

interface Quote {
    date: string,
    price: number
}

interface PriceListResponse {
    Name: string,
    Data: number[][]
}

const Home = () => {
    const [quote1Name, setQuote1Name] = useState('')
    const [quote2Name, setQuote2Name] = useState('')
    const [quoteList1, setQuoteList] = useState<Quote[]>([])
    const [quoteList2, setQuoteList2] = useState<Quote[]>([])

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10))

    const [isValid, setIsValid] = useState(false)

    function corr(d1: number[], d2: number[]): number {
        let { min, pow, sqrt } = Math
        let add = (a: number, b: number) => a + b
        let n = min(d1.length, d2.length)
        if (n === 0) {
            return 0
        }
        [d1, d2] = [d1.slice(0, n), d2.slice(0, n)]
        let [sum1, sum2] = [d1, d2].map(l => l.reduce(add))
        let [pow1, pow2] = [d1, d2].map(l => l.reduce((a, b) => a + pow(b, 2), 0))
        let mulSum = d1.map((n, i) => n * d2[i]).reduce(add)
        let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n))
        if (dense === 0) {
            return 0
        }
        return (mulSum - (sum1 * sum2 / n)) / dense
    }

    // useEffect(() => {
    //     axios.get<PriceListResponse>('https://cors-anywhere.herokuapp.com/https://www.di.se/graphdata/period?period=3y&instrumentId=4404858&startDate=2020-06-05T00%3A00%3A00').then(response => {
    //         const data = response.data.Data
    //         setQuote1Name(response.data.Name)
    //         setQuoteList(data.map(quoteArr => (
    //             { date: new Date(quoteArr[0]).toDateString(), price: quoteArr[1] }
    //         )))
    //     })

    //     axios.get<PriceListResponse>('https://cors-anywhere.herokuapp.com/https://www.di.se/graphdata/period?period=3y&instrumentId=71266&startDate=2020-06-05T00%3A00%3A00').then(response => {
    //         const data = response.data.Data
    //         setQuote2Name(response.data.Name)
    //         setQuoteList2(data.map(quoteArr => (
    //             { date: new Date(quoteArr[0]).toDateString(), price: quoteArr[1] }
    //         )))
    //     })
    // }, [])

    function handleStartDate(event: ChangeEvent<HTMLInputElement>) {
        const startDate = event.target.value
        setStartDate(startDate)
    }

    function handleEndDate(event: ChangeEvent<HTMLInputElement>) {
        const endDate = event.target.value
        setEndDate(endDate)
    }

    function handleQuote1Name(event: ChangeEvent<HTMLInputElement>) {
        const q1Name = event.target.value
        setQuote1Name(q1Name)
    }

    function handleQuote2Name(event: ChangeEvent<HTMLInputElement>) {
        const q2Name = event.target.value
        setQuote2Name(q2Name)
    }

    useEffect(() => {
        let quote1FirstDate = 0
        // F000010YMN
        axios.get<number[][]>(`https://cors-anywhere.herokuapp.com/https://tools.morningstar.se/api/rest.svc/timeseries_cumulativereturn/n4omw1k3rh?id=${quote1Name}&currencyId=SEK&idtype=Morningstar&frequency=daily&startDate=${startDate}&endDate=${endDate}&outputType=COMPACTJSON`).then(response => {
            const data = response.data
            if (data[0] !== undefined) {
                // setQuote1Name(response.data.Name)
                quote1FirstDate = response.data[0][0]
                setIsValid(quote1FirstDate === quote2FirstDate)
                console.log("quote1firstDate", quote1FirstDate)
                if (startDate === '') {
                    const date = new Date(quote1FirstDate).toISOString().substring(0, 10)
                    setStartDate(date)
                }
                setQuoteList(data.map(quoteArr => (
                    { date: new Date(quoteArr[0]).toDateString(), price: quoteArr[1] }
                )))
            }

        })

        // F00000IRBF
        let quote2FirstDate = 0
        axios.get<number[][]>(`https://cors-anywhere.herokuapp.com/https://tools.morningstar.se/api/rest.svc/timeseries_cumulativereturn/n4omw1k3rh?id=${quote2Name}&currencyId=SEK&idtype=Morningstar&frequency=daily&startDate=${startDate}&endDate=${endDate}&outputType=COMPACTJSON`).then(response => {
            const data = response.data
            if (data[0] !== undefined) {
                // setQuote2Name(response.data.Name)
                quote2FirstDate = response.data[0][0]
                setIsValid(quote1FirstDate === quote2FirstDate)
                console.log("quote2firstDate", quote2FirstDate)
                setQuoteList2(data.map(quoteArr => (
                    { date: new Date(quoteArr[0]).toDateString(), price: quoteArr[1] }
                )))
            }
        })

    }, [startDate, endDate, quote1Name, quote2Name])

    return (
        <div>
            <br /><br />
            <label htmlFor="quote1">Id of fund 1:</label>
            <input type="text" id="quote1" name="quote1" value={quote1Name} onChange={handleQuote1Name}></input>
            <label htmlFor="quote2"> Id of fund 2:</label>
            <input type="text" id="quote2" name="quote2" value={quote2Name} onChange={handleQuote2Name}></input>
            <br /><br />

            <label htmlFor="start">Start date:</label>
            <input type="date" id="start" name="period-start" value={startDate} onChange={handleStartDate}></input>
            <label htmlFor="end"> End date:</label>
            <input type="date" id="end" name="period-end" value={endDate} onChange={handleEndDate}></input>
            <br /><br />
            <h2>Correlation: {corr(quoteList1.map(quote => (quote.price)), quoteList2.map(quote => (quote.price)))}</h2>
            <span>Is valid: {String(isValid)}</span>
        </div>
    )
}

export default Home
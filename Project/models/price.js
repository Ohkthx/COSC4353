class Price {

    constructor(price_id, currentprice){
        this.currentprice = currentprice

    }
    get suggestedPrice() {
        return this.currentprice
    }
}
module.exports = Price;

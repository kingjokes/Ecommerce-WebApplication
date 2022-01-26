// default cart variable, which assumes the value of cart stored in local storage
// if the localstorage is not empty, JSON.parse to convert into array format
// else cart is an empty array
let cart =!!localStorage.cart ? JSON.parse(localStorage.cart) : []


$(document).ready(function(){
    //on window load the following actions are fired
    $(window).on('load', function(){
        CartUpdater(cart) //this function contains several functions
        //ajax method to load data asynchronously  from a json file
        $.ajax({
            method:'get',
            url:'data.json',
            dataType:'json',
            beforeSend: function(){
                $('#loading').fadeIn() //shows the loading text
            },
            success:function (response) {
                $('#loading').fadeOut() //hides loading text

                //if item details exists on link, extract and display item details
                if(!!linkExtractor(window.location.href)) itemDetails(response, linkExtractor(window.location.href))

                //a for loop to store response from data and format into html format
                let data=''
                for(let item in response){
                    data += `<div class="col-12 col-sm-3 col-md-3 col-lg-3">
                                <div class="w3-card w3-round-medium">
                                    <div>
                                    <a href="description.html?item=${response[item].name}" title="view item">
                                         <img src="./images/${response[item].image}" alt="${response[item].name} image" style="width: 100%; height: 250px" class="w3-image">
                                    </a>
                                    </div>
                                    <div class="w3-padding" style="line-height: 1.8!important;">
                                        <span class="w3-text-grey text-capitalize">Name: ${response[item].name}</span>
                                        <br>
                                        <span class="w3-text-grey">Price: ${'$'+formatAmount(response[item].price)}</span>
                                        <br>
                                        <span class="w3-text-grey">Quantiy: ${response[item].quantity}</span>
                                        <br>
                                        <button
                                        class="btn add-item btn-primary my-3 btn-block btn-sm w3-mobile"
                                         title="Add ${response[item].name} to cart"
                                         data-item-name="${response[item].name}"
                                         data-item-price="${response[item].price}"
                                         data-item-quantity="${response[item].quantity}"
                                        
                                         >
                                         Add to cart
                                         </button>

                                    </div>
                                     </div>
                              </div>`
                }
                //writes the html format into div with id=response
                $('#response').html(data)

            }
        })
    })
})

//this method allows jquery to communicate with elements added with javascript
//takes 3 parameters : i. event ii.element iii. function to perform
$(document).on('click', '.add-item',function(){
 //this listens to click events on add-item buttons
    ItemChecker(cart, $(this).attr('data-item-name')) // this method performs a check to avoid duplication of entries
     ?   cart.push(
            {
                itemName: $(this).attr('data-item-name'),
                itemPrice: parseFloat($(this).attr('data-item-price')),
                itemQuantity: 1
            }
        ) // if element does not exist, push into cart

     : quantityIncremental(cart, $(this).attr('data-item-name')) //if element exist update the quantity of element

    localStorage.setItem('cart',JSON.stringify(cart)) //store new cart into localStorage

    cartStatus(JSON.parse(localStorage.cart)) //updates the cart element counts on dom
    return cartLister(JSON.parse(localStorage.cart)) //updates the cart element list on dom
})

//function checks if item name exist in the cart
//returns a boolean as response
const ItemChecker =(array, itemName) =>{
    let find = array.find(item => item.itemName === itemName )
    return find === undefined
}

//function increases the quantity of item found in the cart
const quantityIncremental = (array, itemName) =>{
    let index = array.findIndex(item => item.itemName === itemName )
    if(index !== -1) return array[index].itemQuantity +=1

}

//function gets the count of items in cart
//updates the dom in charge of showing cart item count
const cartStatus = (array)=>{
    return $('#cart').html(array.length)
}

//function gets the list of items in the cart and displays them
const cartLister = (array) =>{
    //if the item in cart is 0, display no item found
    if(array.length===0) return $('#cart-list').html('<a class="dropdown-item" href="javascript:void(0)">No item found</a>')
    let list =''

    //if item list is not zero, display each item with name, quantity, price and subtotal
    array.map(item=>{
        list += `<a class="dropdown-item text-capitalize" href="javascript:void(0)">${item.itemName} - (${item.itemQuantity}) * ${item.itemPrice} - ${'$'+formatAmount(item.itemQuantity* parseFloat(item.itemPrice))}   </a>`
    })
    let total = array.reduce((total,item)=> total+ (item.itemQuantity* parseFloat(item.itemPrice)), 0)

    //appends total price of the item in the cart with the check-out link
    list+=`<a class="dropdown-item mt-2" href="check-out.html" style="padding:0!important;">
        <button class="btn btn-primary btn-sm btn-block">Check Out -<b>Total: ${'$'+formatAmount(total)}</b> </button>
        </a>`

    //displays on html dom
    return $('#cart-list').html(list)
}

//function in charge of listing item on the check-out page
const cartTableLister= (array)=>{
    let data =''

    //if no item is the cart, display cart is empty
    if(array.length===0) return $('#item-list').html(`<tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>Your Cart is empty </td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        </tr>`)

    //if item is more than zero,display each item as row with name, price , subtotal, and quantity
    array.map(item => {
        data+=`  <tr>
                    <td class="py-3 text-capitalize">${item.itemName}</td>
                    <td class="py-3">${'$'+item.itemPrice}</td>
                    <td><input
                            type="number"
                            data-code="${item.itemName}"
                            class="form-control text-center  w3-small quantity"
                            value="${item.itemQuantity}"
                           
                             min="1" 
                             >
                    </td>
                    <td class="py-3">${'$'+ formatAmount(parseFloat(item.itemPrice) * parseFloat(item.itemQuantity))}</td>
                    <td>
                        <a href="#"
                           class="btn w3-white text-danger remove-item"
                           data-code="${item.itemName}"
                           title="Remove Item"
                        >
                            <i class="fa fa-remove w3-large"></i>

                        </a>
                    </td>
                </tr>`
    })

    //displays content in the table
    return $('#item-list').html(data)



}

//function in charge of removing element from the cart
$(document).on('click', '.remove-item', function(){

        let cart = JSON.parse(localStorage.cart) //convert content in localStorage to array format
        let find = cart.findIndex(item => item.itemName === $(this).attr('data-code')) //find index of item using item name
        find !== -1 //if found
            ? cart.splice(find,1) //remove item
            : '' //else do nothing

    //return
   return CartUpdater(cart)
} )

//function  displays sum of item price on the check-out page
const cartTableSum = (array)=>{

    //if no item found in  the cart, display $0
    if(array.length===0) return  $('#cart-sum').html('$0')

    //if item found, display the total of the prices* quantity of each item
    return $('#cart-sum').html('$'+formatAmount(array.reduce((total,item)=> total+ (item.itemQuantity* parseFloat(item.itemPrice)), 0)))

}


//function updates the quantity of items on the check-out page
$(document). on('change', '.quantity', function(){
    let cart =JSON.parse(localStorage.cart) //convert localStorage cart to array form
    let find = cart.find(item => item.itemName === $(this).attr('data-code')) //find item in cart using name
    //if the quantity entered by user is 1 or more
    if($(this).val() >= 1){
        find !== undefined //if item was found
            ? find.itemQuantity=$(this).val() //update the item quantity
            :'' //else do nothing

        //update dom
        return CartUpdater(cart)
    }
    //else,alert users and return item value to 1
    window.alert("Quantity can not be less than 1")
    return $(this).val(1)


})

//function calls other functions in-charge of updating html dom, all explained individually
const CartUpdater= (cart) =>{
    localStorage.setItem('cart',JSON.stringify(cart)) //converts cart into string format before storing in local storage
    cartStatus(JSON.parse(localStorage.cart)) //gets cart item count
    cartLister(JSON.parse(localStorage.cart)) //lists cart item
    cartTableLister(JSON.parse(localStorage.cart)) //lists cart item on check out page
    cartTableSum(JSON.parse(localStorage.cart)) //shows sum of item prices * quantity
    checkOutButtonStatus(JSON.parse(localStorage.cart),'#checkout') //updates the checkout button
}

//function to check out users
const checkOut = () =>{
    //user confirmation for checking out
    let condition = window.confirm("Are you sure you want to check out")

    //if users confirms
    if(condition){
        window.alert("Thank you for shopping with us") //alert user
        localStorage.removeItem('cart') //remove cart item from localStorage
        window.location.href='./index.html' //redirects user to home page
        return
    }

    return false
}

//function updates checkout button
const checkOutButtonStatus = (cart, element) =>{
    //if cart item is zero, disable check out button
    if(cart.length !==0) return $(element).prop('disabled',false)

    //else enable button
    return $(element).prop('disabled',true)
}

//format Amount
const formatAmount= (nStr) =>{
    if(nStr === undefined) return 0
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

//function extracts item name from description page
const linkExtractor = (link) =>{
    let extract = link.split('/')  //split link into array
    let lastElement = extract[extract.length-1]//grab the last element
    let get = lastElement.indexOf('=') //grab item after the = mark
    return get=== -1 ? null : lastElement.substring(get+1) //return null if no text exist or return the text

}

//function gets item details
const itemDetails = (data, itemName) =>{
    let find = data.find(item => item.name === itemName) //find item in database
    if(find === undefined) return //if item not found return
    let description = `<div class="col-12 col-sm-5 col-md-5 col-lg-5 ">
                             <img src="./images/${find.image}" alt="${find.name} image" style="width: 100%; height: 250px" class="w3-image">
                      </div>
                      <div class="col-12 col-sm-7 col-md-7 col-lg-7 " style="line-height:2.0">
                          <h5>Description</h5>
                          <div class="my-3">
                            ${find.description}
                          </div>
                          <div class="">
                            <b class="w3-large">Price: ${'$'+ formatAmount(find.price)}</b>
                          </div>
                      </div>`

    let descriptionButton = `  <button
                                class="btn add-item btn-primary my-3 btn-block w3-card w3-mobile"
                                title="Add ${find.name} to cart"
                                data-item-name="${find.name}"
                                data-item-price="${find.price}"
                                data-item-quantity="${find.quantity}"
                                >
                                  Add to cart
                                </button>`

    $('#description').html(description)//write item description
    $('#description-button').html(descriptionButton) //display add to cart button

}
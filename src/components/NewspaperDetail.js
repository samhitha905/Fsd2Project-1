import React, { Component } from 'react';
import { useHistory } from "react-router-dom";
import {
    Card, CardImg, CardText, CardBody, CardTitle, Breadcrumb, BreadcrumbItem,
    Button, Modal, ModalHeader, ModalBody, Label, FormGroup
} from 'reactstrap';
import { Control, LocalForm, Errors } from 'react-redux-form';
import { Loading } from './LoadingComponent';
import { Link } from 'react-router-dom';
import { baseUrl } from '../shared/baseUrl';
import { user_real } from './Login';
import ReactStars from 'react-stars';
import "./Details.css";

class ReviewForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false
        };

        this.toggleModal = this.toggleModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //Handling opening of form which takes review for the selected newspaper
    toggleModal() {
        //User should be valid
        if (user_real) {
            console.log('validated user');
            let cartItems = []
            cartItems = this.props.orders.map((order) => order.cart.map((item) => (item.id)))
            let flag = cartItems.some((value) => value.some((id) => (id === this.props.itemId)))
            //If user has subscribed that item, then the forms opens
            if (flag) {
                this.setState({
                    isModalOpen: !this.state.isModalOpen
                })
            }
            //Else a alert message arrives 
            else {
                alert("You cannot submit review as you have not subscibed this item!!")
            };

        }
        //User should login if they are invalid
        else {
            console.log('invalid user');
            this.props.history.push('/signup');
        }
    }
    //Calling postReview function which posts reviews to the server
    handleSubmit(values) {
        this.toggleModal();
        this.props.postReview(this.props.itemId, parseInt(values.rating), user_real, values.review);
    }

    render() {
        return (

            <React.Fragment>
                <div className="col-12 col-md-7 m-1">
                    <Button outline onClick={this.toggleModal}>
                        <h4><span className="fa fa-pencil fa-lg"></span> Submit Review</h4>
                    </Button></div>
                {/* A review form containing rating and review feilds*/}
                <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>Submit Review</ModalHeader>
                    <ModalBody>
                        <LocalForm onSubmit={(values) => this.handleSubmit(values)} >
                            <FormGroup>
                                <Label htmlFor="rating">Rating</Label>
                                <Control.select model=".rating" name="rating"
                                    className="form-control" >
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                </Control.select>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="review">Review</Label>
                                <Control.textarea model=".review"
                                    id="review" name="review"
                                    rows="6"
                                    className="form-control" />
                            </FormGroup>
                            <Button type="submit" value="submit" color="primary">Submit</Button>
                        </LocalForm>
                    </ModalBody>
                </Modal>

            </React.Fragment>
        );
    }
}

//Function to display the details of reviews given to the selected newspaper
function RenderReviews({ reviews }) {
    //Displaying the reviews if reviews are present for the selected newspaper
        if (reviews.length) {
            return (
                <div className="col-12 col-md-10 m-1">
                    <ul className="product-description">
                        <h3>REVIEWS</h3>
                        {reviews.map((review) => (
                            <li key={review._id}>
                                <p>{review.review}</p>
                                <ReactStars count={5} size={24} value={review.rating} color2={'#ffd700'} edit={false} />
                                <p>---{review.author}, {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(Date.parse(review.updatedAt)))}</p>
                                <br />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        //If no reviews are given, displaying a statement 
        else {
            return (
                <div className="col-12 col-md-10 m-1">
                    <div className="product-description">
                        <h3>REVIEWS</h3>
                        <p>No Reviews are given for this Newspaper.</p>
                    </div>
                </div>
            );
        }
    
}

//Function displaying all the details of selected newspaper 
function RenderItem({ item, addtocart, reviews, postReview, orders }) {
    //Finding average of ratings given to the selected newspaper
    var sum = 0, avg = 0;
    if (reviews.length) {
        sum = reviews.map(review => review.rating).reduce((r1, r2) => r1 + r2, 0);
        avg = sum / reviews.length;
    }

    const history = useHistory();
    if (item != null) {
        //Calling addtocart function if the user is logged in
        const IsLogin = () => {
            if (user_real) {
                console.log('yes')
                addtocart(item._id)
            }
            //Else displaying signup page
            else {
                console.log('no')
                history.push("/signup");

            }
        }
        return (
            <React.Fragment>

                <main className="container1">
                    {/* Diaplaying image in the left side */}
                    <div className="left-column">
                        <img src={baseUrl + item.image} alt={item.name} />
                    </div>
                    {/* Displaying details in the right side */}
                    <div className="right-column">

                        <div className="product-description">
                            <h3>{item.name}</h3>
                            <span>{item.language}</span>
                            <p>{item.description}</p>
                        </div>
                        {/* Add to cart button works if the user is logged in */}
                        <div className="product-price">
                            <span >Rs.{item.price}</span>
                            <div className='zoom'>
                                <button class="cart-btn" onClick={IsLogin}>Add to Cart</button>
                            </div>
                        </div>
                        {/* Displaying the details related to reviews */}
                        <div className='product-description'>
                            <span>Total No. of reviews posted till now: {reviews.length}</span>
                            <span><ReactStars count={5} size={24} value={avg} color2={'#ffd700'} edit={false} /></span>
                        </div>
                        <ReviewForm itemId={item._id} postReview={postReview} history={history} orders={orders} />
                    </div>
                </main>

            </React.Fragment>
        );
    }
    else {
        return (
            <div></div>
        );
    }
}


const NewspaperDetail = (props) => {
    //Calling the loading component when the selected newspaper is loading
    if (props.isLoading) {
        return (
            <div className="container">
                <div className="row">
                    <Loading />
                </div>
            </div>
        );
    }
    //Displaying the error message if the selected newspaper is failed to load
    else if (props.errMess) {
        return (
            <div className="container">
                <div className="row">
                    <h4>{props.errMess}</h4>
                </div>
            </div>
        );
    }
    //Displaying the details of selected newspaper if it is present 
    else if (props.paperSelected != null) {
        return (
            <div className='npde'>
                <div className="container">
                    <div className="row">
                        {/* Breadcrum to navigate easily to newspapers */}
                        <Breadcrumb style={{ fontSize: "20px" }} className='bdcrum'>
                            <BreadcrumbItem><Link to="/home">Home</Link></BreadcrumbItem>
                            <BreadcrumbItem><Link to="/newspapers">Newspapers</Link></BreadcrumbItem>
                            <BreadcrumbItem active>{props.paperSelected.name}</BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                    {/* Calling RenderItem function by sending required properties */}
                    <div className="row">
                        <RenderItem addtocart={props.addtocart} item={props.paperSelected} reviews={props.paperSelected.reviews} postReview={props.postReview} orders={props.checkorders} />
                    </div>
                    {/* Calling RenderReviews function by sending appropriate properties */}
                    <div className="row">
                        <RenderReviews reviews={props.paperSelected.reviews}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default NewspaperDetail;
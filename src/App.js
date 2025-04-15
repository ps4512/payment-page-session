import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AdyenCheckout, Dropin, Card, GooglePay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import './override.css';

const Checkout = () => {

  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);


  useEffect(() => {
    const postData = async () => {
      try {
        const response = await fetch('http://localhost:5002/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setSessionData(data.sessionData); // Update state with fetched data
        setSessionId(data.id); // Update state with fetched data
      } catch (error) {
        console.error('Error:', error);
      }
    };

    postData();
  }, []);

  useEffect(() => {
    if (sessionData) {
      const globalConfiguration = {
        paymentMethodsConfiguration: {
          storedCard:{
            hideCVC: false,
          },
          card: {
            //hasHolderName: true,
            //holderNameRequired: true,
            name: "Credit or debit card, trusted by oracle cloud payment system",
            styles: {
              base: {
                color: 'black',
                fontSize: '16px',
                fontSmoothing: 'antialiased',
                fontFamily: 'Helvetica'
              },
              error: {
                color: 'green'
              },
              placeholder: {
                color: '#d8d8d8'
              },
              validated: {
                color: 'green'
              }
            }
          },
        },
        session: {
          id: sessionId, // Unique identifier for the payment session.
          sessionData: sessionData // The payment session data.
        },
        environment: 'test', // Change to 'live' for the live environment.
        amount: {
          value: 100,
          currency: 'USD'
        },
        locale: 'en-US',
        countryCode: 'US',
        clientKey: 'test_HYAHXGJMHRBMVP3MBLIZEZ4UFA6KRRPW', // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        onPaymentCompleted: (result, component) => {
          console.log("completed")
          console.log(sessionId);
          console.info(result, component);
        },
        onPaymentFailed: (result, component) => {
          console.log("failed")
          console.info(result, component);
        },
        onError: (error, component) => {
          console.log("error")
          console.error(error.name, error.message, error.stack, component);
        }
      };
      async function asyncCall() {
        const checkout = await AdyenCheckout(globalConfiguration);
      
        // Ensure to mount only when the container exists
        const dropinContainer = document.getElementById('dropin-container');
        if (dropinContainer) {
          // Create an instance of Drop-in.
          const dropin = new Dropin(checkout, {
          // Include the payment methods that imported.
          paymentMethodComponents: [Card, GooglePay],
          onReady() {
            console.log("Component is ready to interact with the shopper")
          },
          // Mount it to the container you created.
          paymentMethodsConfiguration: {
            storedCard: {
                hideCVC: true
            },
            card: {
              //hasHolderName: true,
              //holderNameRequired: true,
              name: "Credit or debit card, trusted by oracle cloud payment system",
              styles: {
                base: {
                  color: 'black',
                  //background: "black",
                  fontSize: '16px',
                  fontSmoothing: 'antialiased',
                  fontFamily: 'Helvetica'
                },
                error: {
                  color: 'green'
                },
                placeholder: {
                  color: '#d8d8d8'
                },
                validated: {
                  color: 'green'
                }
              }
            },
        }
          }).mount(dropinContainer);        
        } 
        else {
          console.error("Drop-in container not found.");
        }
      }

      asyncCall()

    }
  }, [sessionData]);

  return <div id="dropin-container"></div>;
}


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Checkout/>}/>
      </Routes>
    </Router>
  );
}

export default App;
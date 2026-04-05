
import stripe
from typing import Dict, Optional
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    
    def create_checkout_session(
        self,
        amount: int,
        currency: str,
        product_name: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        try:
            session_params = {
                'payment_method_types': ['card'],
                'line_items': [{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': product_name,
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                'mode': 'payment',
                'success_url': success_url,
                'cancel_url': cancel_url,
            }
            
            if metadata:
                session_params['metadata'] = metadata
            
            session = stripe.checkout.Session.create(**session_params)
            
            return {
                'id': session.id,
                'url': session.url
            }
        except stripe.error.StripeError as e:
            print(f"Stripe error creating checkout session: {str(e)}")
            return None
        except Exception as e:
            print(f"Error creating checkout session: {str(e)}")
            return None
    
stripe_service = StripeService()
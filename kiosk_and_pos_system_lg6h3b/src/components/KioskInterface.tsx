import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function KioskInterface() {
  const [cardNumber, setCardNumber] = useState("");
  const [member, setMember] = useState<any>(null);
  const [cart, setCart] = useState<Array<{ productId: Id<"products">; quantity: number; product: any }>>([]);
  
  const products = useQuery(api.queries.listProducts) || [];
  const balance = useQuery(api.queries.getMemberBalance, member ? { memberId: member._id } : "skip");
  const placeOrder = useMutation(api.mutations.placeOrder);

  const getMemberByCard = useMutation(api.mutations.getMemberByCardNumber);

  const handleCardScan = async () => {
    if (!cardNumber.trim()) {
      toast.error("Please enter a card number");
      return;
    }

    try {
      const foundMember = await getMemberByCard({ cardNumber: cardNumber.trim() });
      if (foundMember) {
        setMember(foundMember);
        toast.success(`Welcome, ${foundMember.name}!`);
      } else {
        toast.error("Member not found");
        setMember(null);
      }
    } catch (error) {
      toast.error("Error finding member");
      setMember(null);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId: product._id, quantity: 1, product }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: Id<"products">) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: Id<"products">, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!member) {
      toast.error("Please scan your member card first");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const totalAmount = getTotalAmount();
    if (balance && balance.amount < totalAmount) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const result = await placeOrder({
        memberId: member._id,
        items: orderItems,
      });

      toast.success(`Order placed successfully! Order #${result.orderNumber}`);
      setCart([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Member Card Section */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Member Card</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter card number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCardScan}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Scan Card
          </button>
        </div>
        
        {member && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-green-800">{member.name}</p>
                <p className="text-sm text-green-600">{member.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Balance</p>
                <p className="text-lg font-semibold text-green-800">
                  ${balance?.amount.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products
                .filter(product => product.category === category)
                .map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow p-4">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-semibold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!member}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={!member || cart.length === 0}
                className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

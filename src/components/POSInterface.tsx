import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function POSInterface() {
  const orders = useQuery(api.queries.getRecentOrdersForPOS) || [];
  const completeOrder = useMutation(api.mutations.completeOrder);
  const cancelOrder = useMutation(api.mutations.cancelOrder);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder({ orderId: orderId as any });
      toast.success("Order completed successfully");
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete order");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder({ orderId: orderId as any });
      toast.success("Order cancelled and refunded");
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const printReceipt = (order: any) => {
    const receiptContent = `
      ================================
      RECEIPT
      ================================
      Order #: ${order.orderNumber}
      Time: ${new Date(order.time).toLocaleString()}
      
      Items:
      ${order.items.map((item: string) => `  ${item}`).join('\n')}
      
      Total: $${order.totalAmount.toFixed(2)}
      ================================
      Thank you for your order!
      ================================
    `;

    // In a real implementation, this would send to a receipt printer
    // For demo purposes, we'll show it in a new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt - ${order.orderNumber}</title></head>
          <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast.success("Receipt sent to printer");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Pending Orders</h2>
          <p className="text-sm text-gray-600 mt-1">
            {orders.length} pending order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="divide-y max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending orders
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.orderId}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedOrder?.orderId === order.orderId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.time).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-1">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Order Details</h2>
        </div>
        
        {selectedOrder ? (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Order #{selectedOrder.orderNumber}
              </h3>
              <p className="text-gray-600">
                Placed: {new Date(selectedOrder.time).toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3">Items:</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => printReceipt(selectedOrder)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Print Receipt
              </button>
              <button
                onClick={() => handleCompleteOrder(selectedOrder.orderId)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Order
              </button>
              <button
                onClick={() => handleCancelOrder(selectedOrder.orderId)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select an order to view details
          </div>
        )}
      </div>
    </div>
  );
}

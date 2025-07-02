import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AdminInterface() {
  const [activeTab, setActiveTab] = useState<"products" | "members" | "orders">("products");
  const seedData = useMutation(api.seedData.seedSampleData);

  const handleSeedData = async () => {
    try {
      const result = await seedData({});
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to seed data");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Product Management
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Member Management
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Order Management
            </button>
          </nav>
          <button
            onClick={handleSeedData}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Seed Sample Data
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "members" && <MemberManagement />}
        {activeTab === "orders" && <OrderManagement />}
      </div>
    </div>
  );
}

function ProductManagement() {
  const products = useQuery(api.queries.listAllProducts) || [];
  const createProduct = useMutation(api.mutations.createProduct);
  const updateProduct = useMutation(api.mutations.updateProduct);
  const deleteProduct = useMutation(api.mutations.deleteProduct);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct._id,
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          category: formData.category,
          imageUrl: formData.imageUrl || undefined,
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct({
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          category: formData.category,
          imageUrl: formData.imageUrl || undefined,
        });
        toast.success("Product created successfully");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: Id<"products">) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ productId });
        toast.success("Product deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Products</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {editingProduct ? "Update" : "Create"} Product
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Available</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td className="border border-gray-300 px-4 py-2">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-600">{product.description}</div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">{product.category}</td>
                <td className="border border-gray-300 px-4 py-2">
                  ${product.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {product.isAvailable ? "Yes" : "No"}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberManagement() {
  const createMember = useMutation(api.mutations.createMember);
  const addBalance = useMutation(api.mutations.addBalance);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    initialBalance: "",
  });

  const [balanceForm, setBalanceForm] = useState({
    cardNumber: "",
    amount: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      cardNumber: "",
      initialBalance: "",
    });
    setShowForm(false);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cardNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMember({
        name: formData.name,
        email: formData.email,
        cardNumber: formData.cardNumber,
        initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : undefined,
      });
      toast.success("Member created successfully");
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to create member");
    }
  };

  const getMemberByCard = useMutation(api.mutations.getMemberByCardNumber);

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!balanceForm.cardNumber || !balanceForm.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // First find the member
      const member = await getMemberByCard({ cardNumber: balanceForm.cardNumber });
      if (!member) {
        toast.error("Member not found");
        return;
      }

      await addBalance({
        memberId: member._id,
        amount: parseFloat(balanceForm.amount),
      });
      
      toast.success("Balance added successfully");
      setBalanceForm({ cardNumber: "", amount: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add balance");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Member */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Member</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cancel" : "Add Member"}
          </button>
        </div>

        {showForm && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <form onSubmit={handleCreateMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Balance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Add Balance to Member</h3>
        <div className="p-4 border rounded-lg bg-gray-50">
          <form onSubmit={handleAddBalance} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={balanceForm.cardNumber}
                onChange={(e) => setBalanceForm({ ...balanceForm, cardNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Add
              </label>
              <input
                type="number"
                step="0.01"
                value={balanceForm.amount}
                onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Balance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "completed" | "cancelled" | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const orders = useQuery(api.queries.listOrders, {
    filter: statusFilter ? { status: statusFilter } : undefined
  }) || [];

  const orderDetail = useQuery(api.queries.getOrderDetail, 
    selectedOrder ? { orderId: selectedOrder._id } : "skip"
  );

  const receipt = useQuery(api.queries.reprintReceipt,
    selectedOrder ? { orderId: selectedOrder._id } : "skip"
  );

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleReprintReceipt = () => {
    if (receipt) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Receipt - ${receipt.orderNumber}</title></head>
            <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
              ${receipt.content}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success("Receipt reprinted successfully");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Order Management</h3>
        <div className="flex gap-2">
          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value as any || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Order #</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Items</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr 
                key={order._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOrderClick(order)}
              >
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {order.orderNumber}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div>
                    <div className="font-medium">{order.memberName}</div>
                    <div className="text-sm text-gray-600">{order.memberEmail}</div>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(order._creationTime).toLocaleDateString()}
                  <br />
                  <span className="text-sm text-gray-600">
                    {new Date(order._creationTime).toLocaleTimeString()}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getStatusBadge(order.status)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      handleReprintReceipt();
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Reprint
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && orderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order ID</label>
                  <p className="text-sm text-gray-900">{orderDetail.orderId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-sm text-gray-900">{orderDetail.orderNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Time</label>
                  <p className="text-sm text-gray-900">
                    {new Date(orderDetail.orderTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(orderDetail.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{orderDetail.memberName}</p>
                  <p className="text-xs text-gray-600">{orderDetail.memberEmail}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Unit Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orderDetail.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Price:</span>
                  <span>${orderDetail.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Payment Amount:</span>
                  <span>${orderDetail.paymentAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReprintReceipt}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reprint Receipt
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

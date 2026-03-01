import Layout from "../components/Layout";
import FamilyList from "../components/FamilyList";

export default function FamilyManagement() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">Family Members</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage family profiles to check their scheme eligibility.
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <FamilyList />
                </div>
            </div>
        </Layout>
    );
}

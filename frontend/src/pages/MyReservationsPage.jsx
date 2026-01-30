// MyReservationsPage - Buyer view with reservation actions

import { useState } from 'react';
import { useReservations } from '../hooks/useReservations';
import { cancelReservation, confirmReservation } from '../api/reservations';
import ReservationList from '../components/reservations/ReservationList';
import { RESERVATION_STATUS } from '../constants/status';
import './MyReservationsPage.css';

function MyReservationsPage({ currentUser }) {
    const { reservations, loading, error, refetch } = useReservations(
        currentUser ? { buyer_id: currentUser.id } : {}
    );
    const [actionId, setActionId] = useState(null);
    const [actionType, setActionType] = useState(null);



    const handleCancel = async (reservationId) => {
        if (!currentUser) return;
        setActionId(reservationId);
        setActionType('cancel');
        try {
            await cancelReservation(reservationId, currentUser.id);
            refetch();
        } catch (err) {
            console.error('Cancel failed:', err);
        } finally {
            setActionId(null);
            setActionType(null);
        }
    };

    if (!currentUser) {
        return (
            <div className="my-reservations-page">
                <div className="page-message">
                    Select a user to view their reservations.
                </div>
            </div>
        );
    }

    // Separate reservations by status
    const activeReservations = reservations.filter(r => r.status === RESERVATION_STATUS.ACTIVE);
    const completedReservations = reservations.filter(r => r.status === RESERVATION_STATUS.COMPLETED);
    const cancelledReservations = reservations.filter(r => 
        r.status === RESERVATION_STATUS.CANCELLED || r.status === RESERVATION_STATUS.EXPIRED
    );

    return (
        <div className="my-reservations-page">
            <header className="page-header">
                <h1 className="page-title">My Reservations</h1>
                {activeReservations.length > 0 && (
                    <span className="active-count">{activeReservations.length} active</span>
                )}
            </header>

            {loading ? (
                <div className="page-message">Loading reservations...</div>
            ) : error ? (
                <div className="page-message page-error">Error: {error}</div>
            ) : reservations.length === 0 ? (
                <div className="page-message">
                    You haven't reserved any items yet.
                </div>
            ) : (
                <div className="reservations-sections">
                    {activeReservations.length > 0 && (
                        <section className="reservations-section">
                            <h2 className="section-title">Active Reservations</h2>
                            <p className="section-note">⏳ Waiting for seller confirmation. You can cancel anytime.</p>
                            <ReservationList
                                reservations={activeReservations}
                                onCancel={handleCancel}
                                actionId={actionId}
                                actionType={actionType}
                            />
                        </section>
                    )}

                    {completedReservations.length > 0 && (
                        <section className="reservations-section">
                            <h2 className="section-title"> Completed Orders</h2>
                            <p className="section-note">📦 Successfully completed - Contact sellers for any questions</p>
                            <ReservationList reservations={completedReservations} />
                        </section>
                    )}

                    {cancelledReservations.length > 0 && (
                        <section className="reservations-section">
                            <h2 className="section-title"> Cancelled/Expired</h2>
                            <p className="section-note">⚠️ These reservations were cancelled or expired</p>
                            <ReservationList reservations={cancelledReservations} />
                        </section>
                    )}
                </div>
                
                
                
            )}
        </div>
    );
}

export default MyReservationsPage;

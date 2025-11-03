import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles for the PDF receipt
const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 12,
    color: '#111827'
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid'
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827'
  },
  subTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  section: {
    marginTop: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  label: {
    color: '#6b7280'
  },
  value: {
    color: '#111827',
    fontWeight: 600
  },
  footer: {
    marginTop: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    color: '#6b7280',
    fontSize: 10
  }
});

/**
 * ReceiptDocument
 * Props:
 *  - donor: { name, email }
 *  - donation: { id, date, amount, cause, receipt }
 *  - organization: { name, registrationNumber, address, city, state, postalCode }
 */
export function ReceiptDocument({ donor, donation, organization }) {
  const orgName = organization?.name || 'Unknown Organization';
  const registrationNumber = organization?.registrationNumber || 'N/A';
  const orgAddress = organization?.address
    ? `${organization.address}, ${organization.city}, ${organization.state} ${organization.postalCode}`
    : 'Address not available';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Official Tax Receipt</Text>
          <Text style={styles.subTitle}>Resit Rasmi Cukai</Text>
        </View>

        {/* NGO/Charity Information - The Actual Receiver */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Received By / Diterima Oleh</Text>
          <Text style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{orgName}</Text>
          <Text style={{ color: '#374151', fontSize: 10, marginBottom: 2 }}>Registration No: {registrationNumber}</Text>
          <Text style={{ color: '#374151', fontSize: 10 }}>{orgAddress}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt No.</Text>
            <Text style={styles.value}>{donation?.receipt || `RC-${donation?.id}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{donation?.date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8 }}>Donor Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{donor?.name || 'Anonymous Donor'}</Text>
          </View>
          {donor?.email ? (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{donor.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8 }}>Donation Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Campaign</Text>
            <Text style={styles.value}>{donation?.cause}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Donated</Text>
            <Text style={styles.value}>RM {Number(donation?.amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Malaysian Tax Relief Information */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8, fontSize: 11 }}>Tax Relief Information / Maklumat Pelepasan Cukai</Text>
          <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 4 }}>
            <Text style={{ color: '#374151', fontSize: 10, marginBottom: 4 }}>
              This donation is eligible for tax relief under Section 44(6) of the Income Tax Act 1967
              (Akta Cukai Pendapatan 1967).
            </Text>
            <Text style={{ color: '#374151', fontSize: 10, marginBottom: 4 }}>
              Derma ini layak untuk pelepasan cukai di bawah Seksyen 44(6) Akta Cukai Pendapatan 1967.
            </Text>
            <Text style={{ color: '#374151', fontSize: 10, fontWeight: 600, marginTop: 4 }}>
              Please retain this receipt for your income tax filing with Lembaga Hasil Dalam Negeri Malaysia (LHDNM).
            </Text>
          </View>
        </View>

        {/* Acknowledgement Statement */}
        <View style={styles.section}>
          <View style={{ backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4 }}>
            <Text style={{ color: '#374151', fontSize: 10 }}>
              This receipt acknowledges that a cash donation of RM {Number(donation?.amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              was received by {orgName} on {donation?.date}. No goods or services were provided in exchange for this donation.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Facilitated by Relief Connect Platform</Text>
          <Text>Please keep this receipt for your tax records.</Text>
          <Text style={{ marginTop: 4, fontSize: 9 }}>
            For queries, contact the organization directly or Relief Connect support.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default ReceiptDocument;



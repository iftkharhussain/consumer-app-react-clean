/* eslint-disable */
export const theme = {
    token: {
        colorPrimary: '#1A1ABA',
        borderRadius: 8,
        fontFamily: "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        colorBgLayout: '#f5f5f5',
        controlHeight: 40, // Global 40px height for inputs
        colorBorder: '#ededed',
    },
    components: {
        Button: {
            controlHeight: 48,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
        },
        Select: {
            controlHeight: 40,
            borderRadius: 8,
            colorBorder: '#ededed',
        },
        Input: {
            controlHeight: 40,
            borderRadius: 8,
        },
        InputNumber: {
            controlHeight: 40,
            borderRadius: 8,
        },
        DatePicker: {
            controlHeight: 40,
            borderRadius: 8,
        },
        Form: {
            labelFontSize: 15,
            labelColor: '#000',
            itemMarginBottom: 24,
            verticalLabelPadding: '0 0 8px',
            requiredMark: false,
        },
        Card: {
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }
    },
};

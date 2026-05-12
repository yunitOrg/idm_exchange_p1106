import apiModule from '../index2';

// Mock FormData class
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }

  append(key, value) {
    this.data.set(key, value);
  }

  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }

  entries() {
    return this.data.entries();
  }
};

describe('ApiExchangeList', () => {
  const mockPost = window.IDM.http.post;

  beforeEach(() => {
    // Clear all mocks before each test
    mockPost.mockClear();
  });

  test('should call post with all parameters when all are provided', async () => {
    const mockResponse = { data: { success: true, result: [] } };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: '1',
      sendLevel: '2',
      pk: '123',
      moduleId: '456',
      operationFlag: 'create',
      flat: 'true',
      mode: 'edit',
      recordId: '789'
    };

    const result = await apiModule.ApiExchangeList(params);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      'ctrl/remote/sendRangeData',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    expect(result).toEqual({ success: true, result: [] });
  });

  test('should only add isdir to FormData when isdir is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { isdir: '1' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('isdir')).toBe(true);
    expect(formDataCall.get('isdir')).toBe('1');
  });

  test('should not add isdir to FormData when isdir is falsy (undefined)', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { sendLevel: '2' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('isdir')).toBe(false);
  });

  test('should only add sendLevel to FormData when sendLevel is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { sendLevel: '3' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('sendLevel')).toBe(true);
    expect(formDataCall.get('sendLevel')).toBe('3');
  });

  test('should not add sendLevel to FormData when sendLevel is falsy (null)', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { sendLevel: null };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('sendLevel')).toBe(false);
  });

  test('should only add pk to FormData when pk is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: 'abc123' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('pk')).toBe(true);
    expect(formDataCall.get('pk')).toBe('abc123');
  });

  test('should not add pk to FormData when pk is empty string', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: '' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('pk')).toBe(false);
  });

  test('should only add moduleId to FormData when moduleId is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { moduleId: 'module1' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('moduleId')).toBe(true);
    expect(formDataCall.get('moduleId')).toBe('module1');
  });

  test('should not add moduleId to FormData when moduleId is falsy (0)', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { moduleId: 0 };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('moduleId')).toBe(false);
  });

  test('should only add operationFlag to FormData when operationFlag is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { operationFlag: 'update' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('operationFlag')).toBe(true);
    expect(formDataCall.get('operationFlag')).toBe('update');
  });

  test('should not add operationFlag to FormData when operationFlag is falsy (false)', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { operationFlag: false };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('operationFlag')).toBe(false);
  });

  test('should only add flat to FormData when flat is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { flat: 'true' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('flat')).toBe(true);
    expect(formDataCall.get('flat')).toBe('true');
  });

  test('should not add flat to FormData when flat is null', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { flat: null };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('flat')).toBe(false);
  });

  test('should only add mode to FormData when mode is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { mode: 'view' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('mode')).toBe(true);
    expect(formDataCall.get('mode')).toBe('view');
  });

  test('should not add mode to FormData when mode is undefined', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { mode: undefined };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('mode')).toBe(false);
  });

  test('should only add recordId to FormData when recordId is truthy', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { recordId: 'record999' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('recordId')).toBe(true);
    expect(formDataCall.get('recordId')).toBe('record999');
  });

  test('should not add recordId to FormData when recordId is empty string', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { recordId: '' };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('recordId')).toBe(false);
  });

  test('should handle empty object parameter with no FormData entries', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = {};

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    let hasEntries = false;
    for (const [key, value] of formDataCall.entries()) {
      hasEntries = true;
    }
    expect(hasEntries).toBe(false);
  });

  test('should handle combination of truthy and falsy parameters', async () => {
    const mockResponse = { data: { success: true } };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: '1',
      sendLevel: null,
      pk: '',
      moduleId: 'module1',
      operationFlag: undefined,
      flat: 0,
      mode: 'edit',
      recordId: false
    };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('isdir')).toBe(true);
    expect(formDataCall.has('sendLevel')).toBe(false);
    expect(formDataCall.has('pk')).toBe(false);
    expect(formDataCall.has('moduleId')).toBe(true);
    expect(formDataCall.has('operationFlag')).toBe(false);
    expect(formDataCall.has('flat')).toBe(false);
    expect(formDataCall.has('mode')).toBe(true);
    expect(formDataCall.has('recordId')).toBe(false);
  });

  test('should return data from successful API response', async () => {
    const mockResponse = { data: { items: [1, 2, 3], total: 3 } };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: '123' };

    const result = await apiModule.ApiExchangeList(params);

    expect(result).toEqual({ items: [1, 2, 3], total: 3 });
  });

  test('should return empty object when API response has empty data', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: '123' };

    const result = await apiModule.ApiExchangeList(params);

    expect(result).toEqual({});
  });

  test('should throw error when API request fails', async () => {
    const mockError = new Error('Network error');
    mockPost.mockRejectedValue(mockError);

    const params = { pk: '123' };

    await expect(apiModule.ApiExchangeList(params)).rejects.toThrow('Network error');
  });

  test('should throw error when API returns error status', async () => {
    const mockError = new Error('500 Internal Server Error');
    mockPost.mockRejectedValue(mockError);

    const params = { moduleId: 'test' };

    await expect(apiModule.ApiExchangeList(params)).rejects.toThrow('500 Internal Server Error');
  });

  test('should handle numeric string values correctly', async () => {
    const mockResponse = { data: { test: 'value' } };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: '0',
      sendLevel: '1',
      pk: '123',
      moduleId: '456'
    };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.get('isdir')).toBe('0');
    expect(formDataCall.get('sendLevel')).toBe('1');
    expect(formDataCall.get('pk')).toBe('123');
    expect(formDataCall.get('moduleId')).toBe('456');
  });

  test('should call post with correct headers configuration', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: '123' };

    await apiModule.ApiExchangeList(params);

    const headers = mockPost.mock.calls[0][2].headers;
    expect(headers).toEqual({
      'Content-Type': 'application/json'
    });
  });

  test('should call post with correct endpoint URL', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = { pk: '123' };

    await apiModule.ApiExchangeList(params);

    const url = mockPost.mock.calls[0][0];
    expect(url).toBe('ctrl/remote/sendRangeData');
  });

  test('should handle very long string values', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const longString = 'a'.repeat(1000);
    const params = { pk: longString };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.get('pk')).toBe(longString);
  });

  test('should handle special characters in parameter values', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: 'test/value',
      operationFlag: 'update&create',
      mode: 'view-edit'
    };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.get('isdir')).toBe('test/value');
    expect(formDataCall.get('operationFlag')).toBe('update&create');
    expect(formDataCall.get('mode')).toBe('view-edit');
  });

  test('should handle undefined parameter values gracefully', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: undefined,
      sendLevel: undefined,
      pk: '123',
      moduleId: undefined,
      operationFlag: undefined,
      flat: undefined,
      mode: undefined,
      recordId: undefined
    };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('isdir')).toBe(false);
    expect(formDataCall.has('sendLevel')).toBe(false);
    expect(formDataCall.has('pk')).toBe(true);
    expect(formDataCall.has('moduleId')).toBe(false);
    expect(formDataCall.has('operationFlag')).toBe(false);
    expect(formDataCall.has('flat')).toBe(false);
    expect(formDataCall.has('mode')).toBe(false);
    expect(formDataCall.has('recordId')).toBe(false);
  });

  test('should handle all parameters as truthy values', async () => {
    const mockResponse = { data: { success: true } };
    mockPost.mockResolvedValue(mockResponse);

    const params = {
      isdir: 'true',
      sendLevel: 'high',
      pk: 'pk123',
      moduleId: 'mod456',
      operationFlag: 'flag1',
      flat: 'flat',
      mode: 'mode1',
      recordId: 'rec789'
    };

    await apiModule.ApiExchangeList(params);

    const formDataCall = mockPost.mock.calls[0][1];
    expect(formDataCall.has('isdir')).toBe(true);
    expect(formDataCall.has('sendLevel')).toBe(true);
    expect(formDataCall.has('pk')).toBe(true);
    expect(formDataCall.has('moduleId')).toBe(true);
    expect(formDataCall.has('operationFlag')).toBe(true);
    expect(formDataCall.has('flat')).toBe(true);
    expect(formDataCall.has('mode')).toBe(true);
    expect(formDataCall.has('recordId')).toBe(true);
  });

  test('should verify FormData is created fresh for each call', async () => {
    const mockResponse = { data: {} };
    mockPost.mockResolvedValue(mockResponse);

    const params1 = { pk: '123' };
    const params2 = { pk: '456' };

    await apiModule.ApiExchangeList(params1);
    await apiModule.ApiExchangeList(params2);

    expect(mockPost).toHaveBeenCalledTimes(2);
    const formDataCall1 = mockPost.mock.calls[0][1];
    const formDataCall2 = mockPost.mock.calls[1][1];
    expect(formDataCall1.get('pk')).toBe('123');
    expect(formDataCall2.get('pk')).toBe('456');
  });
});
